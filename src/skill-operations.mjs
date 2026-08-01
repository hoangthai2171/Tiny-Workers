import { access, cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const SKILL_NAMES = ['tiny-pm', 'tiny-workers'];

async function exists(filePath) {
  return access(filePath).then(() => true, () => false);
}

export async function runSkillOperation({ action, sourceSkillsDirectory, targetSkillsDirectory, confirm }) {
  const existing = [];
  for (const name of SKILL_NAMES) {
    const destination = path.join(targetSkillsDirectory, name);
    if (await exists(destination)) existing.push(destination);
  }

  if (action === 'uninstall') {
    if (existing.length === 0) return { status: 'skipped', message: 'Tiny-Workers is not installed.' };
    if (!await confirm(`Remove Tiny-Workers skills from ${targetSkillsDirectory}?`)) return { status: 'skipped', message: 'Removal cancelled.' };
    await Promise.all(existing.map((destination) => rm(destination, { recursive: true, force: true })));
    return { status: 'removed', message: 'Removed Tiny-Workers skills.' };
  }

  if (action === 'update' && existing.length === 0) return { status: 'skipped', message: 'Tiny-Workers is not installed.' };
  if (existing.length > 0 && !await confirm(`Replace Tiny-Workers skills in ${targetSkillsDirectory}?`)) return { status: 'skipped', message: 'Update cancelled.' };
  await mkdir(targetSkillsDirectory, { recursive: true });
  for (const name of SKILL_NAMES) {
    const destination = path.join(targetSkillsDirectory, name);
    await rm(destination, { recursive: true, force: true });
    await cp(path.join(sourceSkillsDirectory, name), destination, { recursive: true });
  }
  return action === 'update'
    ? { status: 'updated', message: 'Updated Tiny-Workers skills.' }
    : { status: 'installed', message: 'Installed Tiny-Workers skills.' };
}
