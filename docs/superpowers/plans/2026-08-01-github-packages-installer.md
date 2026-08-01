# Tiny-Workers GitHub Packages Installer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish Tiny-Workers as a GitHub Packages npm CLI that interactively installs, updates, and uninstalls its two skills for supported agents.

**Architecture:** A dependency-free Node.js 20 ESM CLI separates pure agent-target and selection logic from filesystem operations and terminal prompts. The executable loads bundled skills relative to its own location, detects available agent environments, lets users choose multiple numbered targets, then performs a confirmed install, update, or uninstall only for `tiny-pm` and `tiny-workers`.

**Tech Stack:** Node.js 20+, Node built-in test runner, native `fs/promises`, npm, GitHub Actions, GitHub Packages.

## Global Constraints

- Package name is exactly `@hoangthai2171/tiny-workers`.
- Publish only to `https://npm.pkg.github.com`; do not publish to npmjs.com or add Homebrew support.
- Support Codex, Claude Code, Antigravity, OpenCode, and Hermes Agent on macOS, Linux, and Windows.
- Keep `tiny-pm` and `tiny-workers` as separate direct children of every selected agent skills directory.
- Use no runtime npm dependencies and require Node.js 20 or newer.
- Do not use `preinstall`, `install`, or `postinstall` lifecycle scripts.
- Never write into the caller's current project directory.
- Update and uninstall only the two Tiny-Workers skill folders after explicit confirmation.
- Preserve the existing skill contents unless this plan directly changes installer packaging or documentation.

---

## File structure

```text
package.json                         # npm metadata, bin mapping, package allowlist, scripts, GitHub Packages config
bin/tiny-workers.mjs                 # CLI entry point and interactive orchestration
src/agent-targets.mjs                # OS-aware supported-agent paths and discovery
src/selection.mjs                    # Pure multi-number selection parser
src/skill-operations.mjs             # Confirmed install/update/uninstall filesystem operations
test/agent-targets.test.mjs          # Target resolution and discovery tests
test/selection.test.mjs              # Multi-selection parser tests
test/skill-operations.test.mjs       # Temporary-directory operation tests
test/package-contents.test.mjs       # npm pack allowlist test
test/publish-workflow.test.mjs       # GitHub Actions release workflow contract test
test/readme.test.mjs                 # Documented CLI command contract test
.github/workflows/publish.yml        # Release-triggered GitHub Packages publish workflow
README.md                            # User install, update, uninstall, and release documentation
package-lock.json                    # Reproducible npm metadata for CI
```

### Task 1: Package metadata and agent discovery

**Files:**

- Create: `package.json`
- Create: `LICENSE`
- Create: `src/agent-targets.mjs`
- Create: `test/agent-targets.test.mjs`
- Create: `package-lock.json`

**Interfaces:**

- Produces `resolveAgentTargets({ home, platform, env }): AgentTarget[]`, where an `AgentTarget` is `{ id, label, command, configRoot, skillsDirectory }`.
- Produces `detectAvailableAgents(targets, commandExists, directoryExists): Promise<AgentTarget[]>`.
- `resolveAgentTargets` uses these agent IDs: `codex`, `claude-code`, `antigravity`, `opencode`, and `hermes`.
- `detectAvailableAgents` includes an agent when `directoryExists(configRoot)` is true or `commandExists(command)` resolves true.

- [ ] **Step 1: Create the failing target-resolution and discovery tests**

```js
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
```

- [ ] **Step 2: Run the tests and verify they fail because the module is missing**

Run: `node --test test/agent-targets.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/agent-targets.mjs`.

- [ ] **Step 3: Add npm metadata and the minimal agent-target module**

```json
{
  "name": "@hoangthai2171/tiny-workers",
  "version": "0.1.0",
  "description": "Interactive installer for Tiny-Workers agent skills.",
  "type": "module",
  "engines": { "node": ">=20" },
  "bin": { "tiny-workers": "./bin/tiny-workers.mjs" },
  "files": ["bin", "src", "skills", "README.md", "LICENSE", "package.json"],
  "scripts": { "test": "node --test", "pack:check": "npm pack --dry-run" },
  "publishConfig": { "registry": "https://npm.pkg.github.com" },
  "repository": { "type": "git", "url": "git+https://github.com/hoangthai2171/Tiny-Workers.git" },
  "license": "MIT"
}
```

```js
import path from 'node:path';

export function resolveAgentTargets({ home, platform, env }) {
  const pathApi = platform === 'win32' ? path.win32 : path.posix;
  const configHome = platform === 'win32'
    ? env.APPDATA || pathApi.join(home, 'AppData', 'Roaming')
    : env.XDG_CONFIG_HOME || pathApi.join(home, '.config');
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
```

Create `LICENSE` with this exact content:

```text
MIT License

Copyright (c) 2026 Hoang Thai

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 4: Generate the lockfile without adding dependencies**

Run: `npm install --package-lock-only --ignore-scripts`

Expected: Exit 0 and create `package-lock.json` with no dependencies.

- [ ] **Step 5: Run the target tests and verify they pass**

Run: `node --test test/agent-targets.test.mjs`

Expected: PASS with 3 tests and 0 failures.

- [ ] **Step 6: Commit the package metadata and discovery module**

```bash
git add package.json package-lock.json LICENSE src/agent-targets.mjs test/agent-targets.test.mjs
git commit -m "feat: add agent target discovery"
```

### Task 2: Parse multiple numbered selections

**Files:**

- Create: `src/selection.mjs`
- Create: `test/selection.test.mjs`

**Interfaces:**

- Produces `parseSelections(input, optionCount): number[]` using one-based menu numbers.
- Returns unique zero-based indexes in first-entered order.
- Throws `Error('Choose one or more valid menu numbers.')` for empty, nonnumeric, zero, or out-of-range input.

- [ ] **Step 1: Create the failing multi-selection tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { parseSelections } from '../src/selection.mjs';

test('accepts comma- and space-separated menu numbers without duplicates', () => {
  assert.deepEqual(parseSelections('1, 3 2, 3', 5), [0, 2, 1]);
});

test('rejects invalid menu input', () => {
  for (const input of ['', 'zero', '0', '6']) {
    assert.throws(() => parseSelections(input, 5), {
      message: 'Choose one or more valid menu numbers.',
    });
  }
});
```

- [ ] **Step 2: Run the tests and verify they fail because the parser is missing**

Run: `node --test test/selection.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/selection.mjs`.

- [ ] **Step 3: Implement the minimal pure parser**

```js
export function parseSelections(input, optionCount) {
  const values = input.trim().split(/[\\s,]+/).map(Number);
  const indexes = [];
  for (const value of values) {
    if (!Number.isInteger(value) || value < 1 || value > optionCount) {
      throw new Error('Choose one or more valid menu numbers.');
    }
    const index = value - 1;
    if (!indexes.includes(index)) indexes.push(index);
  }
  return indexes;
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `node --test test/selection.test.mjs`

Expected: PASS with 2 tests and 0 failures.

- [ ] **Step 5: Commit the selection parser**

```bash
git add src/selection.mjs test/selection.test.mjs
git commit -m "feat: parse multiple installer selections"
```

### Task 3: Install, update, and uninstall packaged skills safely

**Files:**

- Create: `src/skill-operations.mjs`
- Create: `test/skill-operations.test.mjs`

**Interfaces:**

- Produces `runSkillOperation({ action, sourceSkillsDirectory, targetSkillsDirectory, confirm }): Promise<{ status, message }>`.
- `action` is exactly `install`, `update`, or `uninstall`.
- Copies and removes only `tiny-pm` and `tiny-workers`.
- Calls `confirm(message)` before replacing or deleting an existing skill directory.

- [ ] **Step 1: Create temporary-directory tests for all three actions**

```js
import assert from 'node:assert/strict';
import { access, mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runSkillOperation } from '../src/skill-operations.mjs';

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tiny-workers-'));
  const source = path.join(root, 'source');
  for (const name of ['tiny-pm', 'tiny-workers']) {
    await mkdir(path.join(source, name), { recursive: true });
    await writeFile(path.join(source, name, 'SKILL.md'), name);
  }
  return { root, source, target: path.join(root, 'target') };
}

test('install copies both skill folders', async () => {
  const { source, target } = await fixture();
  await runSkillOperation({ action: 'install', sourceSkillsDirectory: source, targetSkillsDirectory: target, confirm: async () => true });
  assert.equal(await readFile(path.join(target, 'tiny-workers', 'SKILL.md'), 'utf8'), 'tiny-workers');
  assert.equal(await readFile(path.join(target, 'tiny-pm', 'SKILL.md'), 'utf8'), 'tiny-pm');
});

test('update preserves existing skills when replacement is declined', async () => {
  const { source, target } = await fixture();
  await mkdir(path.join(target, 'tiny-pm'), { recursive: true });
  await writeFile(path.join(target, 'tiny-pm', 'SKILL.md'), 'old');
  const result = await runSkillOperation({ action: 'update', sourceSkillsDirectory: source, targetSkillsDirectory: target, confirm: async () => false });
  assert.equal(result.status, 'skipped');
  assert.equal(await readFile(path.join(target, 'tiny-pm', 'SKILL.md'), 'utf8'), 'old');
});

test('uninstall removes only Tiny-Workers skill folders after confirmation', async () => {
  const { target } = await fixture();
  await mkdir(path.join(target, 'tiny-pm'), { recursive: true });
  await mkdir(path.join(target, 'tiny-workers'), { recursive: true });
  await mkdir(path.join(target, 'another-skill'), { recursive: true });
  await runSkillOperation({ action: 'uninstall', sourceSkillsDirectory: '', targetSkillsDirectory: target, confirm: async () => true });
  await assert.rejects(access(path.join(target, 'tiny-pm')));
  await access(path.join(target, 'another-skill'));
});
```

- [ ] **Step 2: Run the tests and verify they fail because the operation module is missing**

Run: `node --test test/skill-operations.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/skill-operations.mjs`.

- [ ] **Step 3: Implement confirmed, scoped filesystem operations**

```js
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
```

- [ ] **Step 4: Run the operation tests and verify they pass**

Run: `node --test test/skill-operations.test.mjs`

Expected: PASS with 3 tests and 0 failures.

- [ ] **Step 5: Commit the skill-operation module**

```bash
git add src/skill-operations.mjs test/skill-operations.test.mjs
git commit -m "feat: manage installed Tiny-Workers skills"
```

### Task 4: Add the interactive executable and package-content verification

**Files:**

- Create: `bin/tiny-workers.mjs`
- Create: `test/package-contents.test.mjs`
- Modify: `package.json`

**Interfaces:**

- The executable accepts `install` (default), `update`, or `uninstall`; other commands print usage and exit 1.
- The executable exports no package API; it runs through `tiny-workers` from the `bin` map.
- The executable passes packaged source path `../skills` resolved from `import.meta.url` to `runSkillOperation`.

- [ ] **Step 1: Create failing executable and package-content tests**

```js
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);

test('prints usage for an unknown action', async () => {
  await assert.rejects(
    execFileAsync(process.execPath, ['bin/tiny-workers.mjs', 'wrong-action']),
    (error) => error.code === 1 && error.stderr.includes('Usage: tiny-workers'),
  );
});

test('npm pack contains the executable and both packaged skills', async () => {
  const { stdout } = await execFileAsync('npm', ['pack', '--dry-run', '--json']);
  const [{ files }] = JSON.parse(stdout);
  const paths = files.map((file) => file.path);
  assert(paths.includes('bin/tiny-workers.mjs'));
  assert(paths.includes('skills/tiny-pm/SKILL.md'));
  assert(paths.includes('skills/tiny-workers/SKILL.md'));
  assert(!paths.some((file) => file.startsWith('test/')));
});
```

- [ ] **Step 2: Run the tests and verify the executable test fails because the CLI is missing**

Run: `node --test test/package-contents.test.mjs`

Expected: FAIL with a missing `bin/tiny-workers.mjs` file.

- [ ] **Step 3: Implement the minimal interactive executable**

```js
#!/usr/bin/env node
import { access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { detectAvailableAgents, resolveAgentTargets } from '../src/agent-targets.mjs';
import { parseSelections } from '../src/selection.mjs';
import { runSkillOperation } from '../src/skill-operations.mjs';

const action = process.argv[2] || 'install';
function commandExists(command) {
  const locator = process.platform === 'win32' ? 'where' : 'which';
  return spawnSync(locator, [command], { stdio: 'ignore' }).status === 0;
}

if (!['install', 'update', 'uninstall'].includes(action)) {
  console.error('Usage: tiny-workers [install|update|uninstall]');
  process.exitCode = 1;
} else {
  const cliDirectory = path.dirname(fileURLToPath(import.meta.url));
  const sourceSkillsDirectory = path.resolve(cliDirectory, '..', 'skills');
  const directoryExists = (directory) => access(directory).then(() => true, () => false);
  const agents = await detectAvailableAgents(resolveAgentTargets({ home: os.homedir(), platform: process.platform, env: process.env }), async (command) => commandExists(command), directoryExists);
  if (agents.length === 0) throw new Error('No supported agent environments were detected.');
  const rl = createInterface({ input: stdin, output: stdout });
  console.log(agents.map((agent, index) => `${index + 1}. ${agent.label}`).join('\n'));
  const selected = parseSelections(await rl.question('Choose one or more agents: '), agents.length).map((index) => agents[index]);
  for (const agent of selected) {
    const result = await runSkillOperation({
      action,
      sourceSkillsDirectory,
      targetSkillsDirectory: agent.skillsDirectory,
      confirm: (message) => rl.question(`${message} [y/N] `).then((answer) => answer.trim().toLowerCase() === 'y'),
    });
    console.log(`${agent.label}: ${result.message}`);
  }
  rl.close();
}
```

- [ ] **Step 4: Run the executable and package-content tests and verify they pass**

Run: `node --test test/package-contents.test.mjs`

Expected: PASS with 2 tests and 0 failures.

- [ ] **Step 5: Run the complete test suite and package check**

Run: `npm test && npm run pack:check`

Expected: All tests pass and the dry-run tarball lists `bin/tiny-workers.mjs`, both `skills/` folders, and no `test/` paths.

- [ ] **Step 6: Commit the executable and tarball test**

```bash
git add bin/tiny-workers.mjs package.json test/package-contents.test.mjs
git commit -m "feat: add interactive npm installer"
```

### Task 5: Automate publishing to GitHub Packages

**Files:**

- Create: `.github/workflows/publish.yml`
- Create: `test/publish-workflow.test.mjs`

**Interfaces:**

- Runs when a GitHub Release is published.
- Requires `contents: read` and `packages: write` permissions.
- Runs `npm ci --ignore-scripts`, `npm test`, `npm pack --dry-run`, and `npm publish` in that order.
- Authenticates `npm publish` with GitHub Actions `GITHUB_TOKEN` through `NODE_AUTH_TOKEN`.

- [ ] **Step 1: Create the failing workflow-shape test**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('publishing workflow has release, test, and package permissions gates', async () => {
  const workflow = await readFile('.github/workflows/publish.yml', 'utf8');
  assert.match(workflow, /release:\s*\n\s*types: \[published\]/);
  assert.match(workflow, /packages: write/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /npm publish/);
});
```

- [ ] **Step 2: Run the workflow-shape test and verify it fails because the workflow is missing**

Run: `node --test test/publish-workflow.test.mjs`

Expected: FAIL with `ENOENT` for `.github/workflows/publish.yml`.

- [ ] **Step 3: Implement the release publishing workflow**

```yaml
name: Publish package

on:
  release:
    types: [published]

permissions:
  contents: read
  packages: write

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://npm.pkg.github.com
          scope: '@hoangthai2171'
      - run: npm ci --ignore-scripts
      - run: npm test
      - run: npm pack --dry-run
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

- [ ] **Step 4: Place the workflow test in the promised file and run it**

Create `test/publish-workflow.test.mjs` from Step 1, then run: `node --test test/publish-workflow.test.mjs`

Expected: PASS with 1 test and 0 failures.

- [ ] **Step 5: Run all tests and validate workflow syntax with GitHub Actions tooling if available**

Run: `npm test`

Expected: All tests pass. If `actionlint` is installed, also run `actionlint .github/workflows/publish.yml` and expect exit 0; otherwise report that only the workflow-shape test was run.

- [ ] **Step 6: Commit the publish workflow and its test**

```bash
git add .github/workflows/publish.yml test/publish-workflow.test.mjs
git commit -m "ci: publish releases to GitHub Packages"
```

### Task 6: Rewrite README installation, update, and uninstall guidance

**Files:**

- Modify: `README.md`
- Create: `test/readme.test.mjs`

**Interfaces:**

- README contains copyable setup, install, update, and uninstall commands for `@hoangthai2171/tiny-workers`.
- README states that users do not need to clone the repository.
- README documents the five supported agents and the two sibling installed skill folders.

- [ ] **Step 1: Create the failing README command test**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('README documents GitHub Packages setup and all installer operations', async () => {
  const readme = await readFile('README.md', 'utf8');
  assert.match(readme, /@hoangthai2171:registry=https:\/\/npm\.pkg\.github\.com/);
  assert.match(readme, /npx @hoangthai2171\/tiny-workers/);
  assert.match(readme, /tiny-workers update/);
  assert.match(readme, /tiny-workers uninstall/);
  assert.match(readme, /do not need to clone/i);
});
```

- [ ] **Step 2: Run the README test and verify it fails against the current README**

Run: `node --test test/readme.test.mjs`

Expected: FAIL because GitHub Packages setup and the operation commands are not documented.

- [ ] **Step 3: Rewrite README.md with the approved user workflow**

Use the following content structure and commands:

````markdown
# Tiny-Workers

Tiny-Workers provides Tiny-PM and its `$tiny-workers` dispatcher as portable Agent Skills.

## Supported agents

Codex, Claude Code, Antigravity, OpenCode, and Hermes Agent.

## Install

You do not need to clone this repository. Configure the GitHub Packages scope once:

```sh
npm config set @hoangthai2171:registry https://npm.pkg.github.com
npm login --scope=@hoangthai2171 --registry=https://npm.pkg.github.com
```

Use a classic GitHub personal access token with `read:packages` when npm asks for a password. Then run the installer from any directory:

```sh
npx @hoangthai2171/tiny-workers
```

Select one or more numbered agents, for example `1,3,5`. The installer places `tiny-pm/` and `tiny-workers/` directly in each selected agent's global skills directory.

## Update

```sh
npx @hoangthai2171/tiny-workers update
```

The command displays detected agents and asks before replacing either existing Tiny-Workers skill folder.

## Uninstall

```sh
npx @hoangthai2171/tiny-workers uninstall
```

After confirmation, this removes only the selected agents' `tiny-pm/` and `tiny-workers/` folders.
````

- [ ] **Step 4: Run the README test and all project tests**

Run: `npm test`

Expected: All tests pass, including the README command test.

- [ ] **Step 5: Manually verify the README commands match package metadata**

Run: `node --input-type=module -e "import packageInfo from './package.json' with { type: 'json' }; if (packageInfo.name !== '@hoangthai2171/tiny-workers' || packageInfo.bin['tiny-workers'] !== './bin/tiny-workers.mjs') process.exit(1)"`

Expected: Exit 0.

- [ ] **Step 6: Commit the README rewrite and its test**

```bash
git add README.md test/readme.test.mjs
git commit -m "docs: explain skill installation lifecycle"
```

### Task 7: Final release-readiness verification

**Files:**

- Verify: `package.json`
- Verify: `bin/tiny-workers.mjs`
- Verify: `skills/tiny-pm/SKILL.md`
- Verify: `skills/tiny-workers/SKILL.md`
- Verify: `.github/workflows/publish.yml`
- Verify: `README.md`

**Interfaces:**

- The GitHub Release workflow is ready to publish the version from `package.json`.
- A packed tarball contains everything the executable needs to install both skills.

- [ ] **Step 1: Run the entire test suite**

Run: `npm test`

Expected: Every Node test passes with 0 failures.

- [ ] **Step 2: Inspect the exact npm tarball contents**

Run: `npm pack --json`

Expected: A tarball named `hoangthai2171-tiny-workers-0.1.0.tgz` is created and its JSON metadata reports files under `bin/`, `src/`, and both `skills/tiny-pm/` and `skills/tiny-workers/` directories.

- [ ] **Step 3: Remove the generated tarball after inspecting it**

Run: `rm hoangthai2171-tiny-workers-0.1.0.tgz`

Expected: The tarball is removed; no generated package archive remains in the worktree.

- [ ] **Step 4: Verify the worktree contains only intended changes**

Run: `git status --short`

Expected: Only the installer, tests, workflow, README, package metadata, and this plan/spec documentation are changed; no tarball is listed.

- [ ] **Step 5: Commit final verification adjustments if any are necessary**

```bash
git add package.json package-lock.json bin src test .github README.md
git commit -m "test: verify installer release package"
```

Expected: Create this commit only if the verification steps require a source change. Otherwise, do not create an empty commit.
