# Tiny-Workers

A collection of work flow skills the help keeping your Agents in check. Making your Agent a real project's butler.

## Supported agents

Codex, Claude Code, Antigravity, OpenCode, and Hermes Agent.

## Install

You do not need to clone this repository. Tiny-Workers is a public package on npmjs.org, so no registry configuration or login is needed for installation:

```sh
npx @hoangthai2171/tiny-workers
```

Select one or more numbered agents, for example `1,3,5`. The installer places `tiny-pm/` and `tiny-workers/` directly in each selected agent's global skills directory.

## Usage

Simply call

```sh
$tiny-workers
```

at the start of the session and you're good to go.

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
