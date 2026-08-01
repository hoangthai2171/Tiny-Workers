import { access, cp, mkdir, mkdtemp, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';

const SKILL_NAMES = ['tiny-pm', 'tiny-workers'];
const DEFAULT_FILE_SYSTEM = { access, cp, mkdir, mkdtemp, rename, rm, stat };

async function exists(filePath, fileSystem) {
  return fileSystem.access(filePath).then(() => true, () => false);
}

async function validateSources(sourceSkillsDirectory, fileSystem) {
  for (const name of SKILL_NAMES) {
    const source = path.join(sourceSkillsDirectory, name);
    const sourceStats = await fileSystem.stat(source);
    if (!sourceStats.isDirectory()) {
      throw new Error(`Packaged skill source is not a directory: ${source}`);
    }
  }
}

async function rollbackReplacement({ backedUp, installed, targetSkillsDirectory, transactionDirectory, fileSystem }) {
  const rollbackErrors = [];
  const rollbackDirectory = path.join(transactionDirectory, 'rollback');
  await fileSystem.mkdir(rollbackDirectory, { recursive: true });

  for (const name of [...installed].reverse()) {
    const destination = path.join(targetSkillsDirectory, name);
    try {
      await fileSystem.rename(destination, path.join(rollbackDirectory, name));
    } catch (renameError) {
      try {
        await fileSystem.rm(destination, { recursive: true, force: true });
      } catch (removeError) {
        rollbackErrors.push(renameError, removeError);
      }
    }
  }

  for (const name of [...backedUp].reverse()) {
    try {
      await fileSystem.rename(
        path.join(transactionDirectory, 'backup', name),
        path.join(targetSkillsDirectory, name),
      );
    } catch (error) {
      rollbackErrors.push(error);
    }
  }

  return rollbackErrors;
}

async function replaceSkills({ sourceSkillsDirectory, targetSkillsDirectory, existing, fileSystem }) {
  await fileSystem.mkdir(targetSkillsDirectory, { recursive: true });
  const transactionDirectory = await fileSystem.mkdtemp(
    path.join(targetSkillsDirectory, '.tiny-workers-transaction-'),
  );
  let preserveTransaction = false;

  try {
    const stagedDirectory = path.join(transactionDirectory, 'staged');
    const backupDirectory = path.join(transactionDirectory, 'backup');
    await fileSystem.mkdir(stagedDirectory, { recursive: true });
    await fileSystem.mkdir(backupDirectory, { recursive: true });

    for (const name of SKILL_NAMES) {
      await fileSystem.cp(
        path.join(sourceSkillsDirectory, name),
        path.join(stagedDirectory, name),
        { recursive: true },
      );
    }

    const backedUp = [];
    const installed = [];
    try {
      for (const name of existing) {
        await fileSystem.rename(
          path.join(targetSkillsDirectory, name),
          path.join(backupDirectory, name),
        );
        backedUp.push(name);
      }
      for (const name of SKILL_NAMES) {
        await fileSystem.rename(
          path.join(stagedDirectory, name),
          path.join(targetSkillsDirectory, name),
        );
        installed.push(name);
      }
    } catch (operationError) {
      let rollbackErrors;
      try {
        rollbackErrors = await rollbackReplacement({
          backedUp,
          installed,
          targetSkillsDirectory,
          transactionDirectory,
          fileSystem,
        });
      } catch (rollbackError) {
        rollbackErrors = [rollbackError];
      }
      if (rollbackErrors.length > 0) {
        preserveTransaction = true;
        throw new AggregateError(
          [operationError, ...rollbackErrors],
          `Skill replacement failed and rollback was incomplete: ${operationError.message}`,
        );
      }
      throw operationError;
    }
  } finally {
    if (!preserveTransaction) {
      await fileSystem.rm(transactionDirectory, { recursive: true, force: true }).catch(() => {});
    }
  }
}

export async function runSkillOperation({
  action,
  sourceSkillsDirectory,
  targetSkillsDirectory,
  confirm,
  fileSystem: fileSystemOverrides = {},
}) {
  if (typeof targetSkillsDirectory !== 'string' || !path.isAbsolute(targetSkillsDirectory)) {
    throw new Error('Target skills directory must be an absolute path.');
  }
  const fileSystem = { ...DEFAULT_FILE_SYSTEM, ...fileSystemOverrides };
  const existing = [];
  for (const name of SKILL_NAMES) {
    const destination = path.join(targetSkillsDirectory, name);
    if (await exists(destination, fileSystem)) existing.push(name);
  }

  if (action === 'uninstall') {
    if (existing.length === 0) return { status: 'skipped', message: 'Tiny-Workers is not installed.' };
    if (!await confirm(`Remove Tiny-Workers skills from ${targetSkillsDirectory}?`)) return { status: 'skipped', message: 'Removal cancelled.' };
    await Promise.all(existing.map((name) => fileSystem.rm(
      path.join(targetSkillsDirectory, name),
      { recursive: true, force: true },
    )));
    return { status: 'removed', message: 'Removed Tiny-Workers skills.' };
  }

  if (action === 'update' && existing.length === 0) return { status: 'skipped', message: 'Tiny-Workers is not installed.' };
  await validateSources(sourceSkillsDirectory, fileSystem);
  if (existing.length > 0 && !await confirm(`Replace Tiny-Workers skills in ${targetSkillsDirectory}?`)) {
    return action === 'update'
      ? { status: 'skipped', message: 'Update cancelled.' }
      : { status: 'skipped', message: 'Installation cancelled.' };
  }
  await replaceSkills({
    sourceSkillsDirectory,
    targetSkillsDirectory,
    existing,
    fileSystem,
  });
  return action === 'update'
    ? { status: 'updated', message: 'Updated Tiny-Workers skills.' }
    : { status: 'installed', message: 'Installed Tiny-Workers skills.' };
}
