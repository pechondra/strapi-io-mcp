# strapi-io-mcp

> 🇨🇿 **Czech version:** [README.cs.md](./README.cs.md)

A local **Model Context Protocol (MCP)** server for **Strapi v5** (tested against `5.43.x`, REST API). Full coverage of content, files, single types, i18n, draft/publish and users.

Works against any Strapi instance — **cloud or self-hosted** — configured via environment variables (`STRAPI_URL`, `STRAPI_API_TOKEN`).

---

## Contents

- [Features](#features)
- [Installation](#installation)
- [Strapi configuration](#strapi-configuration)
- [MCP client configuration](#mcp-client-configuration)
  - [Claude Desktop](#claude-desktop)
  - [Claude Code (CLI)](#claude-code-cli)
  - [Claude Code in IDE / Cursor](#claude-code-in-ide--cursor)
  - [OpenAI Codex CLI](#openai-codex-cli)
  - [ChatGPT (OpenAI)](#chatgpt-openai)
- [Available tools](#available-tools)
- [Usage examples](#usage-examples)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Content CRUD** for collection types and single types (Strapi v5 `documentId`).
- **File uploads** — from a local path or base64; can be linked directly to an existing entry via `ref`/`refId`/`field`.
- **Media library management** — list, delete, update metadata (alt text, caption…).
- **Filters, populate, sort, pagination, fields** — full support for Strapi REST query parameters including the `LHS bracket` syntax (via `qs`).
- **Draft & Publish** — `status=draft|published`, plus dedicated `publish`/`unpublish` tools.
- **i18n** — `locale` parameter and a tool to list all configured locales.
- **Authentication** — either an API token from the admin panel, or users-permissions JWT (login/register/me).
- **Users-permissions** — list/create/update/delete users.
- **Generic escape hatch** (`strapi_request`) — any REST endpoint (custom routes, content-type-builder, roles, plugin endpoints…).
- **Self-hosted ready** — configurable base URL, timeout and authentication mode.

---

## Installation

> Requires **Node.js ≥ 18** and `git`.

### A) From GitHub — clone and build (recommended)

```bash
git clone https://github.com/pechondra/strapi-io-mcp.git
cd strapi-io-mcp
npm install
npm run build
```

The resulting binary is `./dist/index.js`. Get its absolute path with:

```bash
echo "$(pwd)/dist/index.js"
```

You will paste this path into your MCP client configuration (see below).

### B) Global install straight from GitHub

```bash
npm install -g github:pechondra/strapi-io-mcp
```

This installs the `strapi-io-mcp` command on your PATH (the `prepare` script in `package.json` automatically runs the build). In your MCP client configuration you can then use:

```json
{ "command": "strapi-io-mcp", "args": [] }
```

You can verify the binary location with `which strapi-io-mcp`.

### C) No-install via `npx`

```bash
npx -y github:pechondra/strapi-io-mcp
```

And in the MCP client configuration:

```json
{
  "command": "npx",
  "args": ["-y", "github:pechondra/strapi-io-mcp"]
}
```

> ⚠️ The first `npx` run from GitHub fetches and builds the package, which can take a moment. For production / repeated use prefer option A or B.

### Updating

```bash
# option A (clone)
cd strapi-io-mcp && git pull && npm install && npm run build

# option B (global install)
npm install -g github:pechondra/strapi-io-mcp
```

---

## Strapi configuration

The server reads the following environment variables. Set them in your MCP client config (see below) or via the shell.

| Variable | Required | Default | Description |
|---|---|---|---|
| `STRAPI_URL` | yes | `http://localhost:1337` | Base URL of your Strapi instance, **with no trailing slash**. For self-hosted e.g. `https://cms.mycompany.com`. |
| `STRAPI_API_TOKEN` | recommended | — | API token from the admin panel: **Settings → API Tokens → Create new**. Recommended type: `Full access` (for all operations) or `Custom` with selected permissions. |
| `STRAPI_EMAIL` | optional | — | Email for users-permissions login (alternative to the API token). |
| `STRAPI_PASSWORD` | optional | — | Password for users-permissions login. |
| `STRAPI_TIMEOUT_MS` | optional | `30000` | HTTP timeout in milliseconds. |

**Recommendation:** use `STRAPI_API_TOKEN`. Email/password login is better suited to testing or end-user scenarios.

> If your Strapi instance requires a **Custom API token**, remember to grant it permissions for `Upload`, `Users-Permissions`, `Content-Type-Builder` and every content type you want to work with. Without `Full access` a token will not, for example, reach `strapi_list_content_types`.

---

## MCP client configuration

The path to the binary in the examples below is `/ABSOLUTE/PATH/strapi-io-mcp/dist/index.js`. Replace it with your real path (run `pwd` inside the project).

### Claude Desktop

Configuration file:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "strapi": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/strapi-io-mcp/dist/index.js"],
      "env": {
        "STRAPI_URL": "https://cms.mycompany.com",
        "STRAPI_API_TOKEN": "<paste-token-here>"
      }
    }
  }
}
```

Restart Claude Desktop. The new `strapi` MCP source should appear in the chat.

### Claude Code (CLI)

The simplest option is to add it through the CLI:

```bash
claude mcp add strapi \
  --env STRAPI_URL=https://cms.mycompany.com \
  --env STRAPI_API_TOKEN=<paste-token-here> \
  -- node /ABSOLUTE/PATH/strapi-io-mcp/dist/index.js
```

Or edit `~/.claude.json` manually (under the `mcpServers` key):

```json
{
  "mcpServers": {
    "strapi": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/strapi-io-mcp/dist/index.js"],
      "env": {
        "STRAPI_URL": "https://cms.mycompany.com",
        "STRAPI_API_TOKEN": "<paste-token-here>"
      }
    }
  }
}
```

For **per-project** configuration, use `.mcp.json` at the project root (same format).

### Claude Code in IDE / Cursor

The Cursor / VS Code Claude extension reads `.mcp.json` at the workspace root or `~/.cursor/mcp.json` (for Cursor):

```json
{
  "mcpServers": {
    "strapi": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/strapi-io-mcp/dist/index.js"],
      "env": {
        "STRAPI_URL": "https://cms.mycompany.com",
        "STRAPI_API_TOKEN": "<paste-token-here>"
      }
    }
  }
}
```

### OpenAI Codex CLI

The Codex CLI (`codex`) supports MCP servers via `~/.codex/config.toml`:

```toml
[mcp_servers.strapi]
command = "node"
args = ["/ABSOLUTE/PATH/strapi-io-mcp/dist/index.js"]

[mcp_servers.strapi.env]
STRAPI_URL = "https://cms.mycompany.com"
STRAPI_API_TOKEN = "<paste-token-here>"
```

You can then call any `strapi_*` tool inside a Codex session.

### ChatGPT (OpenAI)

ChatGPT Desktop / Web offers two ways to wire up MCP:

**1) Local MCP via ChatGPT Desktop (macOS/Windows, Pro/Team/Enterprise)**

Open **Settings → Connectors → Add MCP server** and fill in:

- *Name*: `strapi`
- *Command*: `node`
- *Args*: `/ABSOLUTE/PATH/strapi-io-mcp/dist/index.js`
- *Environment*:
  - `STRAPI_URL` = `https://cms.mycompany.com`
  - `STRAPI_API_TOKEN` = `<paste-token-here>`

Save, enable the server in the *Connectors* dialog and switch on **Developer mode** in the chat (this allows tool calls).

**2) Via Custom GPT / Actions (remote access)**

ChatGPT Custom GPTs natively call MCP servers over HTTP. To expose this server on the web, wrap it with `mcp-proxy` or `supergateway`:

```bash
npx -y supergateway --stdio "node /ABSOLUTE/PATH/strapi-io-mcp/dist/index.js" --port 8787
```

…and add an Action in your Custom GPT pointing at `https://<your-domain>:8787/sse`. (We recommend running this behind an HTTPS reverse proxy with proper authorisation — see the [supergateway docs](https://github.com/supercorp-ai/supergateway).)

---

## Available tools

The server exposes **27 tools**. Each returns the raw JSON from Strapi (Strapi errors are surfaced as MCP error responses including the response body).

### Content — collection types

| Tool | Description |
|---|---|
| `strapi_list_entries` | `GET /api/:pluralApiId` — list entries with `filters`, `populate`, `sort`, `pagination`, `status`, `locale`, `fields`. |
| `strapi_get_entry` | `GET /api/:pluralApiId/:documentId` — single entry. |
| `strapi_create_entry` | `POST /api/:pluralApiId` — create an entry. Defaults to `published`; pass `status=draft` for a draft. |
| `strapi_update_entry` | `PUT /api/:pluralApiId/:documentId` — partial update (relations: `connect`/`disconnect`/`set`). |
| `strapi_delete_entry` | `DELETE /api/:pluralApiId/:documentId`. |
| `strapi_publish_entry` | Publish a draft (PUT with `status=published`). |
| `strapi_unpublish_entry` | Unpublish (PUT with `status=draft`). |
| `strapi_count_entries` | Returns `pagination.total` for the given filter. |

### Content — single types

| Tool | Description |
|---|---|
| `strapi_get_single_type` | `GET /api/:singularApiId`. |
| `strapi_update_single_type` | `PUT /api/:singularApiId`. |
| `strapi_delete_single_type` | `DELETE /api/:singularApiId`. |

### Files (Upload plugin)

| Tool | Description |
|---|---|
| `strapi_upload_file` | `POST /api/upload` — multipart upload from `filePath` or `fileBase64`. Optionally attaches to an entry via `ref`/`refId`/`field`. |
| `strapi_list_files` | `GET /api/upload/files` — list files with filters. |
| `strapi_get_file` | `GET /api/upload/files/:id`. |
| `strapi_delete_file` | `DELETE /api/upload/files/:id`. |
| `strapi_update_file_info` | `POST /api/upload?id=:id` — update `name`/`alternativeText`/`caption`. |

### Auth & users (users-permissions)

| Tool | Description |
|---|---|
| `strapi_login` | `POST /api/auth/local` — returns a JWT (cached for subsequent calls). |
| `strapi_register` | `POST /api/auth/local/register`. |
| `strapi_get_me` | `GET /api/users/me`. |
| `strapi_list_users` | `GET /api/users`. |
| `strapi_create_user` | `POST /api/users`. |
| `strapi_update_user` | `PUT /api/users/:id`. |
| `strapi_delete_user` | `DELETE /api/users/:id`. |

### Meta / introspection

| Tool | Description |
|---|---|
| `strapi_list_locales` | `GET /api/i18n/locales`. |
| `strapi_list_content_types` | `GET /content-type-builder/content-types` (requires admin permissions). |
| `strapi_request` | Generic REST escape hatch — `method`, `path`, `query`, `body`, `headers`. Use this for custom routes and anything else. |

---

## Usage examples

### List published articles with filters and a populated cover image

```json
{
  "tool": "strapi_list_entries",
  "args": {
    "pluralApiId": "articles",
    "filters": { "title": { "$containsi": "strapi" } },
    "populate": { "cover": true, "author": { "fields": ["name"] } },
    "sort": ["createdAt:desc"],
    "pagination": { "page": 1, "pageSize": 20 },
    "status": "published",
    "locale": "en"
  }
}
```

### Create an article as a draft

```json
{
  "tool": "strapi_create_entry",
  "args": {
    "pluralApiId": "articles",
    "status": "draft",
    "data": {
      "title": "New article",
      "slug": "new-article",
      "body": "…"
    }
  }
}
```

### Upload an image and attach it to an article

Strapi v5 requires a **two-step** flow (uploading a file as part of entry creation is no longer supported):

```json
// 1) upload
{
  "tool": "strapi_upload_file",
  "args": {
    "filePath": "/Users/me/Pictures/cover.jpg",
    "fileInfo": { "alternativeText": "Article cover" }
  }
}
// → response contains [{ id: 42, ... }]

// 2) update the entry with the file id
{
  "tool": "strapi_update_entry",
  "args": {
    "pluralApiId": "articles",
    "documentId": "bw64dnu97i56nq85106yt4du",
    "data": { "cover": 42 }
  }
}
```

Alternative — upload with the relation in a single call (the entry must already exist):

```json
{
  "tool": "strapi_upload_file",
  "args": {
    "filePath": "/Users/me/Pictures/cover.jpg",
    "ref": "api::article.article",
    "refId": 17,
    "field": "cover"
  }
}
```

### Connect / disconnect a relation

```json
{
  "tool": "strapi_update_entry",
  "args": {
    "pluralApiId": "articles",
    "documentId": "bw64dnu97i56nq85106yt4du",
    "data": {
      "categories": { "connect": [3, 4], "disconnect": [1] }
    }
  }
}
```

### Custom endpoint (escape hatch)

```json
{
  "tool": "strapi_request",
  "args": {
    "method": "GET",
    "path": "/api/users-permissions/roles"
  }
}
```

---

## Troubleshooting

- **`401 Unauthorized`** — the token is missing or lacks permissions. Check the Strapi admin panel under *Settings → API Tokens → Permissions*.
- **`404 Not Found` for an existing content type** — are you using the correct `pluralApiId` (plural, kebab-case, e.g. `blog-posts`)?
- **Upload fails with `413`** — Strapi has an upload size limit (`Settings → Media Library`). On self-hosted setups raise it in your reverse proxy / Strapi config.
- **Filters seem to be ignored** — by default Strapi only honours filters on `find` endpoints. Custom controllers must opt in explicitly.
- **The server fails to start in Claude Desktop** — check the log: macOS `~/Library/Logs/Claude/mcp*.log`. The most common issues are an incorrect absolute path or `node` missing from PATH.

---

## Licence

MIT
