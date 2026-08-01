#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { detectAvailableAgents, resolveAgentTargets } from '../src/agent-targets.mjs';
import { parseSelections } from '../src/selection.mjs';
import { runSkillOperation } from '../src/skill-operations.mjs';

const VALID_ACTIONS = new Set(['install', 'update', 'uninstall']);
const action = process.argv[2] ?? 'install';

function commandExists(command) {
  const locator = process.platform === 'win32' ? 'where' : 'which';
  return spawnSync(locator, [command], { stdio: 'ignore' }).status === 0;
}

function directoryExists(directory) {
  return access(directory).then(() => true, () => false);
}

if (!VALID_ACTIONS.has(action)) {
  console.error('Usage: tiny-workers [install|update|uninstall]');
  process.exitCode = 1;
} else {
  const cliDirectory = path.dirname(fileURLToPath(import.meta.url));
  const sourceSkillsDirectory = path.resolve(cliDirectory, '..', 'skills');
  const targets = resolveAgentTargets({
    home: os.homedir(),
    platform: process.platform,
    env: process.env,
  });
  const agents = await detectAvailableAgents(targets, commandExists, directoryExists);

  if (agents.length === 0) {
    throw new Error('No supported agent environments were detected.');
  }

  const readline = createInterface({ input: stdin, output: stdout });
  try {
    console.log(agents.map((agent, index) => `${index + 1}. ${agent.label}`).join('\n'));
    const selection = await readline.question('Choose one or more agents: ');
    const selectedAgents = parseSelections(selection, agents.length)
      .map((index) => agents[index]);

    for (const agent of selectedAgents) {
      const result = await runSkillOperation({
        action,
        sourceSkillsDirectory,
        targetSkillsDirectory: agent.skillsDirectory,
        confirm: (message) => readline.question(`${message} [y/N] `)
          .then((answer) => answer.trim().toLowerCase() === 'y'),
      });
      console.log(`${agent.label}: ${result.message}`);
    }
  } finally {
    readline.close();
  }
}
