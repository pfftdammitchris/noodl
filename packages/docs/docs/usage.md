---
sidebar_label: Usage
sidebar_position: 3
slug: /usage
title: Usage
---

```bash
noodl-cli --help
```

## CLI Commands

All of the following documentation is available in the tool by running `noodl --help`

### Operations

#### `generate`

Runs a script to generate files

```shell
noodl --generate app
```

##### Options

| Argument | Description                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------- |
| `app`    | Scaffold an entire app by generating the files associated with a _config_ (`--config` or `-c`) |

#### `server`

Runs a server that serves yml files and assets.

##### Options

| Option           | Description                                                                                             | Default     |
| ---------------- | ------------------------------------------------------------------------------------------------------- | ----------- |
| `--config`, `-c` | Sets the config                                                                                         |
| `--host`, `-h`   | Sets the host                                                                                           | `127.0.0.1` |
| `--port`, `-p`   | Sets the port                                                                                           | `3001`      |
| `--local`        | Changes `cadlBaseUrl` and `myBaseUrl` to local after files are generated (ex: `http://127.0.0.1:3001/`) | `false`     |
| `--watch`        | Listen to file changes                                                                                  | `true`      |
| `--wss`          | Enables live reloading for the noodl files                                                              | `false`     |
| `--wssPort`      | Sets the port for live reloading                                                                        | `3002`      |
