import assert from 'node:assert/strict';
import test from 'node:test';
import { detectAvailableAgents, resolveAgentTargets } from '../src/agent-targets.mjs';

test('resolves the macOS and Linux global skill directories', () => {
  const targets = resolveAgentTargets({
    home: '/home/alex',
    platform: 'linux',
    env: {},
  });

  assert.deepEqual(
    Object.fromEntries(targets.map(({ id, skillsDirectory }) => [id, skillsDirectory])),
    {
      codex: '/home/alex/.codex/skills',
      'claude-code': '/home/alex/.claude/skills',
      antigravity: '/home/alex/.gemini/config/skills',
      opencode: '/home/alex/.config/opencode/skills',
      hermes: '/home/alex/.hermes/skills',
    },
  );
});

test('uses APPDATA for the Windows OpenCode skills directory', () => {
  const targets = resolveAgentTargets({
    home: 'C:\\Users\\Alex',
    platform: 'win32',
    env: { APPDATA: 'C:\\Users\\Alex\\AppData\\Roaming' },
  });

  assert.equal(
    targets.find((target) => target.id === 'opencode').skillsDirectory,
    'C:\\Users\\Alex\\AppData\\Roaming\\opencode\\skills',
  );
});

test('ignores a relative XDG_CONFIG_HOME on POSIX', () => {
  const targets = resolveAgentTargets({
    home: '/home/alex',
    platform: 'linux',
    env: { XDG_CONFIG_HOME: 'relative/config' },
  });

  assert.equal(
    targets.find((target) => target.id === 'opencode').skillsDirectory,
    '/home/alex/.config/opencode/skills',
  );
});

test('ignores a drive-relative APPDATA on Windows', () => {
  const targets = resolveAgentTargets({
    home: 'C:\\Users\\Alex',
    platform: 'win32',
    env: { APPDATA: 'C:AppData\\Roaming' },
  });

  assert.equal(
    targets.find((target) => target.id === 'opencode').skillsDirectory,
    'C:\\Users\\Alex\\AppData\\Roaming\\opencode\\skills',
  );
});

test('detects an agent from either its config root or executable', async () => {
  const targets = [{ id: 'codex', configRoot: '/home/alex/.codex', command: 'codex' }];

  assert.deepEqual(
    await detectAvailableAgents(targets, async () => false, async () => true),
    targets,
  );
  assert.deepEqual(
    await detectAvailableAgents(targets, async () => true, async () => false),
    targets,
  );
});
