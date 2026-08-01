# Tiny-Workers GitHub Packages Installer Design

## Goal

Package Tiny-Workers as a cross-platform Node.js CLI that users can run with `npx` from any directory. The CLI will interactively install, update, or uninstall the Tiny-Workers skills in selected supported agents' global skills directories.

## Scope

The first release supports Codex, Claude Code, Google Antigravity, OpenCode, and Hermes Agent on macOS, Linux, and Windows. It installs the existing `tiny-pm` and `tiny-workers` skills without changing their contents.

The package is published only to GitHub Packages under the `hoangthai2171` account. It is not published to npmjs.com and does not provide a Homebrew formula.

## Distribution

The package name is `@hoangthai2171/tiny-workers`. Its `package.json` declares:

- an executable named `tiny-workers` through the `bin` field;
- `https://npm.pkg.github.com` as `publishConfig.registry`;
- `https://github.com/hoangthai2171/Tiny-Workers.git` as its repository; and
- a package file allowlist containing only the CLI, the two skill directories, README, license, and package metadata.

Users configure the scoped GitHub Packages registry and authenticate with a classic GitHub personal access token that has `read:packages`, then run the installer from any directory:

```sh
npm config set @hoangthai2171:registry https://npm.pkg.github.com
npm login --scope=@hoangthai2171 --registry=https://npm.pkg.github.com
npx @hoangthai2171/tiny-workers
```

The package has no install, preinstall, or postinstall lifecycle script. Installation into an agent directory happens only when the user explicitly runs the CLI.

## CLI behavior

The default command is `install`; `update` and `uninstall` are explicit subcommands:

```text
npx @hoangthai2171/tiny-workers [install]
npx @hoangthai2171/tiny-workers update
npx @hoangthai2171/tiny-workers uninstall
```

For every operation, the CLI discovers available agent environments, prints a numbered list, and accepts a comma- or space-separated list of selection numbers. The list includes an agent when its known configuration root exists or its CLI executable is available on `PATH`.

The target adapters are isolated from the CLI flow and resolve their global skill destinations from the user home/config locations for the current platform:

- Codex: `.codex/skills`
- Claude Code: `.claude/skills`
- Antigravity: `.gemini/config/skills`
- OpenCode: its platform configuration directory followed by `opencode/skills`
- Hermes Agent: `.hermes/skills`

`install` creates a missing target skills directory and copies both source skill folders. The installed layout is always:

```text
<agent-skills-directory>/
  tiny-pm/
    SKILL.md
    agents/openai.yaml
  tiny-workers/
    SKILL.md
    agents/openai.yaml
```

The two folders are intentionally siblings, not nested: `tiny-pm` remains independently discoverable and `tiny-workers` can invoke it.

`update` replaces only these two existing skill folders after confirmation. `uninstall` deletes only these two selected folders after confirmation. A rejected confirmation leaves the target unchanged. The CLI never reads or writes the caller's current project directory.

The process reports a per-agent summary and exits nonzero if every selected operation fails.

## Implementation boundaries

The CLI uses Node.js built-ins only, with a Node.js 20 or newer engine requirement. It resolves the packaged source skills relative to the executable's own file URL, never relative to the shell's current working directory. Filesystem operations and terminal interaction are separated so the core detection, selection parsing, target resolution, and operation planning can be tested without a real home directory or interactive terminal.

## Release automation

A GitHub Actions workflow runs tests, packs the package, and publishes to GitHub Packages when a GitHub Release is published. The workflow uses `GITHUB_TOKEN`, `contents: read`, and `packages: write`; no personal token is stored in the repository. The workflow does not create releases or publish versions by itself.

## Documentation

README installation guidance will cover the one-time GitHub Packages configuration, the `npx` command, permanent global installation, supported agents, and the fact that a repository clone is unnecessary.

README update guidance will use the `update` subcommand. Uninstallation guidance will use the `uninstall` subcommand and explain that it removes only `tiny-pm` and `tiny-workers` after confirmation.

## Testing and verification

Node's built-in test runner will cover platform target resolution, agent discovery, multi-number input parsing, install/update/uninstall plans, confirmation refusal, copying both skill folders, and failure summaries. A package-content check will confirm the published tarball includes the executable and both skills but not tests or development-only files. The CI workflow will run the test suite before packaging or publishing.

## Non-goals

- Publishing to npmjs.com or Homebrew.
- Installing skills automatically through npm lifecycle scripts.
- Installing unsupported agents or workspace-local skills.
- Replacing any skill other than Tiny-PM and Tiny-Workers.
- Automatically creating a GitHub Release or changing GitHub Package visibility.
