# Tiny-Workers

Tiny-Workers provides Tiny-PM and its `$tiny-workers` dispatcher as portable Agent Skills.

## Supported agents

Codex, Claude Code, Antigravity, OpenCode, and Hermes Agent.

## Install

You do not need to clone this repository. Tiny-Workers is a public package on npmjs.org, so no registry configuration or login is needed for installation:

```sh
npx @hoangthai2171/tiny-workers
```

If you previously configured this scope for GitHub Packages, point the old mapping at npmjs.org:

```sh
npm config set @hoangthai2171:registry https://registry.npmjs.org/ --location=user
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

## Publishing

The release workflow publishes to npmjs.org. Configure a repository secret named `NPM_TOKEN` with permission to publish this package before publishing a GitHub Release.
