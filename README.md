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
