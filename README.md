<div align="center">

# 🚀 strapi-io-mcp

**A local Model Context Protocol (MCP) server for Strapi v5**

Bring your Strapi headless CMS into Claude, Cursor, Codex and ChatGPT.

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Node 18+](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![Strapi v5](https://img.shields.io/badge/Strapi-v5.43.x-8E75FF.svg)](https://strapi.io/)
[![MCP](https://img.shields.io/badge/MCP-1.x-orange.svg)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg)](https://www.typescriptlang.org/)

[Features](#-features) · [Quick start](#-quick-start) · [Configuration](#-strapi-configuration) · [MCP clients](#-mcp-client-configuration) · [Tools](#-available-tools) · [Examples](#-usage-examples) · [Troubleshooting](#-troubleshooting)

🇨🇿 **Czech version:** [README.cs.md](./README.cs.md)

</div>

---

## ✨ Features

| | |
|---|---|
| 🗂️ **Content CRUD** | Collection types and single types using Strapi v5 `documentId` |
| 🖼️ **File uploads** | From local path or base64 — optionally attach to entries in one call |
| 📦 **Media library** | List, fetch, delete, update metadata (alt text, caption…) |
| 🔍 **Powerful queries** | Full Strapi REST query parameters — `filters`, `populate`, `sort`, `pagination`, `fields` |
| 📰 **Draft & Publish** | `status=draft\|published`, plus dedicated `publish` / `unpublish` tools |
| 🌍 **i18n** | `locale` parameter and a tool to list configured locales |
| 🔐 **Auth** | API token **or** users-permissions JWT (login / register / me) |
| 👥 **Users** | List / create / update / delete users via users-permissions |
| 🛠️ **Escape hatch** | Generic `strapi_request` for custom routes and any other endpoint |
| 🏠 **Self-hosted ready** | Configurable base URL, timeout and authentication mode |

> **27 tools** across content, files, single types, i18n, draft/publish, users and meta endpoints.

---

## ⚡ Quick start

```bash
git clone https://github.com/pechondra/strapi-io-mcp.git
cd strapi-io-mcp
npm install && npm run build
```

Add to your MCP client (Claude Desktop, Claude Code, Cursor, Codex, ChatGPT — see [below](#-mcp-client-configuration)):

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

That's it. Restart your client and start asking your model to manage content.

---

## 📦 Installation

> **Requires:** Node.js ≥ 18 and `git`.

<details>
<summary><b>A) Clone &amp; build (recommended)</b></summary>

```bash
git clone https://github.com/pechondra/strapi-io-mcp.git
cd strapi-io-mcp
npm install
npm run build
```

The binary is `./dist/index.js`. Get its absolute path with:

```bash
echo "$(pwd)/dist/index.js"
```

</details>

<details>
<summary><b>B) Global install from GitHub</b></summary>

```bash
npm install -g github:pechondra/strapi-io-mcp
```

This installs the `strapi-io-mcp` command on your `PATH` (the `prepare` script automatically builds TypeScript). In your MCP client config use:

```json
{ "command": "strapi-io-mcp", "args": [] }
```

Verify with `which strapi-io-mcp`.

</details>

<details>
<summary><b>C) No-install via <code>npx</code></b></summary>

```bash
npx -y github:pechondra/strapi-io-mcp
```

In your MCP client config:

```json
{
  "command": "npx",
  "args": ["-y", "github:pechondra/strapi-io-mcp"]
}
```

> ⚠️ The first `npx` run from GitHub fetches and builds the package, which can take a moment. For repeated use prefer option A or B.

</details>

<details>
<summary><b>Updating</b></summary>

```bash
# option A (clone)
cd strapi-io-mcp && git pull && npm install && npm run build

# option B (global install)
npm install -g github:pechondra/strapi-io-mcp
```

</details>

---

## 🔧 Strapi configuration

The server reads the following environment variables. Set them via your MCP client config (see below) or your shell.

| Variable | Required | Default | Description |
|---|:---:|---|---|
| `STRAPI_URL` | ✅ | `http://localhost:1337` | Base URL of your Strapi instance, **no trailing slash**. Self-hosted e.g. `https://cms.mycompany.com`. |
| `STRAPI_API_TOKEN` | 🟡 *recommended* | — | API token from the admin panel: **Settings → API Tokens → Create new**. |
| `STRAPI_EMAIL` | ⚪ | — | Email for users-permissions login (alternative to API token). |
| `STRAPI_PASSWORD` | ⚪ | — | Password for users-permissions login. |
| `STRAPI_TIMEOUT_MS` | ⚪ | `30000` | HTTP timeout in milliseconds. |

> 💡 **Recommendation:** prefer `STRAPI_API_TOKEN`. Email/password login is better suited to testing or end-user scenarios.

> ⚠️ For a **Custom API token**, grant permissions for `Upload`, `Users-Permissions`, `Content-Type-Builder` and every content type you want to access. Without `Full access`, calls like `strapi_list_content_types` will fail.

---

## 🔌 MCP client configuration

Replace `/ABSOLUTE/PATH/strapi-io-mcp/dist/index.js` with your real path (run `pwd` inside the cloned directory).

<details>
<summary><b>🤖 Claude Desktop</b></summary>

Edit the configuration file:

| OS | Path |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

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

</details>

<details>
<summary><b>⌨️ Claude Code (CLI)</b></summary>

Easiest — add via the CLI:

```bash
claude mcp add strapi \
  --env STRAPI_URL=https://cms.mycompany.com \
  --env STRAPI_API_TOKEN=<paste-token-here> \
  -- node /ABSOLUTE/PATH/strapi-io-mcp/dist/index.js
```

Or edit `~/.claude.json` manually under the `mcpServers` key:

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

</details>

<details>
<summary><b>💻 Claude Code in IDE / Cursor</b></summary>

The Cursor / VS Code Claude extension reads `.mcp.json` at the workspace root or `~/.cursor/mcp.json` (Cursor):

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

</details>

<details>
<summary><b>🧪 OpenAI Codex CLI</b></summary>

Codex CLI (`codex`) supports MCP servers via `~/.codex/config.toml`:

```toml
[mcp_servers.strapi]
command = "node"
args = ["/ABSOLUTE/PATH/strapi-io-mcp/dist/index.js"]

[mcp_servers.strapi.env]
STRAPI_URL = "https://cms.mycompany.com"
STRAPI_API_TOKEN = "<paste-token-here>"
```

You can then call any `strapi_*` tool inside a Codex session.

</details>

<details>
<summary><b>💬 ChatGPT (OpenAI)</b></summary>

ChatGPT Desktop / Web offers two ways to wire up MCP.

**1) Local MCP via ChatGPT Desktop** *(macOS/Windows, Pro/Team/Enterprise)*

Open **Settings → Connectors → Add MCP server** and fill in:

| Field | Value |
|---|---|
| Name | `strapi` |
| Command | `node` |
| Args | `/ABSOLUTE/PATH/strapi-io-mcp/dist/index.js` |
| Env: `STRAPI_URL` | `https://cms.mycompany.com` |
| Env: `STRAPI_API_TOKEN` | `<paste-token-here>` |

Save, enable the server in *Connectors* and turn on **Developer mode** in the chat to allow tool calls.

**2) Custom GPT / Actions (remote access)**

ChatGPT Custom GPTs call MCP servers natively over HTTP. To expose this server on the web, wrap it with `mcp-proxy` or `supergateway`:

```bash
npx -y supergateway --stdio "node /ABSOLUTE/PATH/strapi-io-mcp/dist/index.js" --port 8787
```

Then add an Action in your Custom GPT pointing at `https://<your-domain>:8787/sse`. We recommend running this behind an HTTPS reverse proxy with proper authorisation — see the [supergateway docs](https://github.com/supercorp-ai/supergateway).

</details>

---

## 🧰 Available tools

The server exposes **27 tools**. Each returns the raw JSON from Strapi (errors are surfaced as MCP error responses including the response body).

### 📰 Collection types

| Tool | Endpoint | Purpose |
|---|---|---|
| `strapi_list_entries` | `GET /api/:pluralApiId` | List entries with filters / populate / sort / pagination / status / locale / fields |
| `strapi_get_entry` | `GET /api/:pluralApiId/:documentId` | Fetch a single entry |
| `strapi_create_entry` | `POST /api/:pluralApiId` | Create an entry (`status=draft` for a draft) |
| `strapi_update_entry` | `PUT /api/:pluralApiId/:documentId` | Partial update — supports relation `connect`/`disconnect`/`set` |
| `strapi_delete_entry` | `DELETE /api/:pluralApiId/:documentId` | Delete an entry |
| `strapi_publish_entry` | PUT with `status=published` | Publish a draft |
| `strapi_unpublish_entry` | PUT with `status=draft` | Unpublish a published entry |
| `strapi_count_entries` | `GET /api/:pluralApiId` | Returns `pagination.total` for a filter |

### 📄 Single types

| Tool | Endpoint | Purpose |
|---|---|---|
| `strapi_get_single_type` | `GET /api/:singularApiId` | Fetch the single type entry |
| `strapi_update_single_type` | `PUT /api/:singularApiId` | Update or create the single type entry |
| `strapi_delete_single_type` | `DELETE /api/:singularApiId` | Delete the single type entry |

### 📁 Files (Upload plugin)

| Tool | Endpoint | Purpose |
|---|---|---|
| `strapi_upload_file` | `POST /api/upload` | Multipart upload from `filePath` or `fileBase64` (optional `ref`/`refId`/`field`) |
| `strapi_list_files` | `GET /api/upload/files` | List files with filters |
| `strapi_get_file` | `GET /api/upload/files/:id` | Fetch a file by id |
| `strapi_delete_file` | `DELETE /api/upload/files/:id` | Delete a file |
| `strapi_update_file_info` | `POST /api/upload?id=:id` | Update `name` / `alternativeText` / `caption` |

### 👤 Users-permissions

| Tool | Endpoint | Purpose |
|---|---|---|
| `strapi_login` | `POST /api/auth/local` | Login — returns JWT (cached) |
| `strapi_register` | `POST /api/auth/local/register` | Register a new user |
| `strapi_get_me` | `GET /api/users/me` | Get the authenticated user |
| `strapi_list_users` | `GET /api/users` | List users |
| `strapi_create_user` | `POST /api/users` | Create user |
| `strapi_update_user` | `PUT /api/users/:id` | Update user |
| `strapi_delete_user` | `DELETE /api/users/:id` | Delete user |

### 🌍 Meta / introspection

| Tool | Endpoint | Purpose |
|---|---|---|
| `strapi_list_locales` | `GET /api/i18n/locales` | List configured locales |
| `strapi_list_content_types` | `GET /content-type-builder/content-types` | Content type schemas (admin permissions) |
| `strapi_request` | *any* | Generic REST escape hatch — `method`, `path`, `query`, `body`, `headers` |

---

## 💡 Usage examples

<details open>
<summary><b>List published articles with filters and a populated cover</b></summary>

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

</details>

<details>
<summary><b>Create an article as a draft</b></summary>

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

</details>

<details>
<summary><b>Upload an image and attach it to an article</b></summary>

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

Alternatively — upload with the relation in a single call (the entry must already exist):

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

</details>

<details>
<summary><b>Connect / disconnect a relation</b></summary>

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

</details>

<details>
<summary><b>Custom endpoint (escape hatch)</b></summary>

```json
{
  "tool": "strapi_request",
  "args": {
    "method": "GET",
    "path": "/api/users-permissions/roles"
  }
}
```

</details>

---

## 🩺 Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `401 Unauthorized` | Token missing or lacks permissions. Check **Settings → API Tokens → Permissions**. |
| `404 Not Found` for an existing content type | Are you using the correct `pluralApiId` (plural, kebab-case, e.g. `blog-posts`)? |
| Upload fails with `413` | Strapi has an upload size limit (**Settings → Media Library**). On self-hosted, raise it in the reverse proxy / Strapi config. |
| Filters seem to be ignored | By default Strapi only honours filters on `find` endpoints. Custom controllers must opt in explicitly. |
| Server fails to start in Claude Desktop | Check the log: macOS `~/Library/Logs/Claude/mcp*.log`. Most common: incorrect absolute path or `node` missing from `PATH`. |

---

## 🤝 Contributing

Issues and pull requests welcome at [github.com/pechondra/strapi-io-mcp](https://github.com/pechondra/strapi-io-mcp).

```bash
git clone https://github.com/pechondra/strapi-io-mcp.git
cd strapi-io-mcp
npm install
npm run dev   # tsc --watch
```

---

## 📜 Licence

[MIT](./LICENSE) © pechondra

<div align="center">

If this project helps you, consider starring it on [GitHub](https://github.com/pechondra/strapi-io-mcp) ⭐

</div>
