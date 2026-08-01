import path from 'node:path';

export function resolveAgentTargets({ home, platform, env }) {
  const pathApi = platform === 'win32' ? path.win32 : path.posix;
  const configuredHome = platform === 'win32' ? env.APPDATA : env.XDG_CONFIG_HOME;
  const fallbackConfigHome = platform === 'win32'
    ? pathApi.join(home, 'AppData', 'Roaming')
    : pathApi.join(home, '.config');
  const configHome = typeof configuredHome === 'string' && pathApi.isAbsolute(configuredHome)
    ? configuredHome
    : fallbackConfigHome;
  const definitions = [
    ['codex', 'Codex', 'codex', pathApi.join(home, '.codex')],
    ['claude-code', 'Claude Code', 'claude', pathApi.join(home, '.claude')],
    ['antigravity', 'Antigravity', 'agy', pathApi.join(home, '.gemini', 'config')],
    ['opencode', 'OpenCode', 'opencode', pathApi.join(configHome, 'opencode')],
    ['hermes', 'Hermes Agent', 'hermes', pathApi.join(home, '.hermes')],
  ];
  return definitions.map(([id, label, command, configRoot]) => ({
    id,
    label,
    command,
    configRoot,
    skillsDirectory: pathApi.join(configRoot, 'skills'),
  }));
}

export async function detectAvailableAgents(targets, commandExists, directoryExists) {
  const results = await Promise.all(targets.map(async (target) => ({
    target,
    available: await directoryExists(target.configRoot) || await commandExists(target.command),
  })));
  return results.filter(({ available }) => available).map(({ target }) => target);
}
