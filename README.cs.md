<div align="center">

# 🚀 strapi-io-mcp

**Lokální Model Context Protocol (MCP) server pro Strapi v5**

Propojte svůj Strapi headless CMS s Claude, Cursor, Codex i ChatGPT.

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Node 18+](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![Strapi v5](https://img.shields.io/badge/Strapi-v5.43.x-8E75FF.svg)](https://strapi.io/)
[![MCP](https://img.shields.io/badge/MCP-1.x-orange.svg)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg)](https://www.typescriptlang.org/)

[Vlastnosti](#-vlastnosti) · [Rychlý start](#-rychlý-start) · [Konfigurace](#-konfigurace-strapi) · [MCP klienti](#-konfigurace-mcp-klientů) · [Nástroje](#-dostupné-nástroje) · [Příklady](#-příklady-použití) · [Troubleshooting](#-řešení-problémů)

🇬🇧 **English version:** [README.md](./README.md)

</div>

---

## ✨ Vlastnosti

| | |
|---|---|
| 🗂️ **CRUD obsahu** | Collection types i single types s `documentId` (Strapi v5) |
| 🖼️ **Upload souborů** | Z lokální cesty nebo base64 — volitelně rovnou připojit k existující entitě |
| 📦 **Media library** | Listování, načtení, mazání, úprava metadat (alt text, caption…) |
| 🔍 **Pokročilé dotazy** | Plná podpora Strapi REST query — `filters`, `populate`, `sort`, `pagination`, `fields` |
| 📰 **Draft & Publish** | `status=draft\|published` plus dedikované `publish` / `unpublish` toolky |
| 🌍 **i18n** | Parametr `locale` a tool pro výpis nakonfigurovaných locales |
| 🔐 **Autentizace** | API token **nebo** users-permissions JWT (login / register / me) |
| 👥 **Uživatelé** | List / create / update / delete přes users-permissions |
| 🛠️ **Escape hatch** | Generický `strapi_request` pro custom routes a libovolný endpoint |
| 🏠 **Self-hosted ready** | Konfigurovatelný base URL, timeout i typ autentizace |

> **27 nástrojů** napříč obsahem, soubory, single types, i18n, draft/publish, uživateli a meta endpointy.

---

## ☕ Podpořte projekt

Tenhle MCP server vzniká a udržuje se ve volném čase. Pokud vám `strapi-io-mcp` ušetří pár hodin proklikávání ve Strapi adminu — káva dlouho vydrží a pomůže projektu růst.

<div align="center">

<a href="https://buymeacoffee.com/infofhv" target="_blank">
  <img src="https://img.shields.io/badge/Kupte%20mi%20kávu-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me a Coffee" />
</a>

*Bez tlaku — ⭐ na repu mi taky udělá radost.*

</div>

---

## ⚡ Rychlý start

```bash
git clone https://github.com/pechondra/strapi-io-mcp.git
cd strapi-io-mcp
npm install && npm run build
```

Přidejte do svého MCP klienta (Claude Desktop, Claude Code, Cursor, Codex, ChatGPT — viz [níže](#-konfigurace-mcp-klientů)):

```json
{
  "mcpServers": {
    "strapi": {
      "command": "node",
      "args": ["/ABSOLUTNI/CESTA/strapi-io-mcp/dist/index.js"],
      "env": {
        "STRAPI_URL": "https://cms.mojefirma.cz",
        "STRAPI_API_TOKEN": "<vlozte-token>"
      }
    }
  }
}
```

A je to. Restartujte klienta a začněte modelu zadávat úkoly nad obsahem.

---

## 📦 Instalace

> **Vyžaduje:** Node.js ≥ 18 a `git`.

<details>
<summary><b>A) Clone &amp; build (doporučeno)</b></summary>

```bash
git clone https://github.com/pechondra/strapi-io-mcp.git
cd strapi-io-mcp
npm install
npm run build
```

Hotová binárka: `./dist/index.js`. Absolutní cestu zjistíte:

```bash
echo "$(pwd)/dist/index.js"
```

</details>

<details>
<summary><b>B) Globální instalace přímo z GitHubu</b></summary>

```bash
npm install -g github:pechondra/strapi-io-mcp
```

Tím se nainstaluje příkaz `strapi-io-mcp` do `PATH` (skript `prepare` automaticky vybuilduje TypeScript). V konfiguraci MCP klienta pak použijete:

```json
{ "command": "strapi-io-mcp", "args": [] }
```

Cestu lze ověřit přes `which strapi-io-mcp`.

</details>

<details>
<summary><b>C) Bez instalace přes <code>npx</code></b></summary>

```bash
npx -y github:pechondra/strapi-io-mcp
```

V konfiguraci MCP klienta:

```json
{
  "command": "npx",
  "args": ["-y", "github:pechondra/strapi-io-mcp"]
}
```

> ⚠️ První spuštění přes `npx` z GitHubu balíček stáhne a vybuilduje (může chvíli trvat). Pro produkční / opakované použití preferujte variantu A nebo B.

</details>

<details>
<summary><b>Aktualizace</b></summary>

```bash
# varianta A (clone)
cd strapi-io-mcp && git pull && npm install && npm run build

# varianta B (globální)
npm install -g github:pechondra/strapi-io-mcp
```

</details>

---

## 🔧 Konfigurace Strapi

Server čte tyto proměnné prostředí. Nastavte je přes konfiguraci MCP klienta (níže) nebo v shellu.

| Proměnná | Povinné | Default | Popis |
|---|:---:|---|---|
| `STRAPI_URL` | ✅ | `http://localhost:1337` | Base URL Strapi instance, **bez koncového lomítka**. Self-hosted např. `https://cms.mojefirma.cz`. |
| `STRAPI_API_TOKEN` | 🟡 *doporučené* | — | API token z admin panelu: **Settings → API Tokens → Create new**. |
| `STRAPI_EMAIL` | ⚪ | — | Email pro users-permissions login (alternativa k API tokenu). |
| `STRAPI_PASSWORD` | ⚪ | — | Heslo pro users-permissions login. |
| `STRAPI_TIMEOUT_MS` | ⚪ | `30000` | HTTP timeout v ms. |

> 💡 **Doporučení:** preferujte `STRAPI_API_TOKEN`. Login přes email/heslo je vhodný spíš pro testování / uživatelské scénáře.

> ⚠️ U **Custom API tokenu** povolte oprávnění pro `Upload`, `Users-Permissions`, `Content-Type-Builder` a každý content type, který chcete používat. Bez `Full access` selžou volání jako `strapi_list_content_types`.

---

## 🔌 Konfigurace MCP klientů

Cestu `/ABSOLUTNI/CESTA/strapi-io-mcp/dist/index.js` v příkladech nahraďte skutečnou cestou (z `pwd` v naklonovaném adresáři).

<details>
<summary><b>🤖 Claude Desktop</b></summary>

Konfigurační soubor:

| OS | Cesta |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "strapi": {
      "command": "node",
      "args": ["/ABSOLUTNI/CESTA/strapi-io-mcp/dist/index.js"],
      "env": {
        "STRAPI_URL": "https://cms.mojefirma.cz",
        "STRAPI_API_TOKEN": "<vlozte-token>"
      }
    }
  }
}
```

Restartujte Claude Desktop. V chatu by se měl objevit nový MCP zdroj `strapi`.

</details>

<details>
<summary><b>⌨️ Claude Code (CLI)</b></summary>

Nejjednodušší — přidat přes CLI:

```bash
claude mcp add strapi \
  --env STRAPI_URL=https://cms.mojefirma.cz \
  --env STRAPI_API_TOKEN=<vlozte-token> \
  -- node /ABSOLUTNI/CESTA/strapi-io-mcp/dist/index.js
```

Nebo ručně do `~/.claude.json` (klíč `mcpServers`):

```json
{
  "mcpServers": {
    "strapi": {
      "command": "node",
      "args": ["/ABSOLUTNI/CESTA/strapi-io-mcp/dist/index.js"],
      "env": {
        "STRAPI_URL": "https://cms.mojefirma.cz",
        "STRAPI_API_TOKEN": "<vlozte-token>"
      }
    }
  }
}
```

Pro **per-project** nastavení použijte `.mcp.json` v rootu projektu (stejný formát).

</details>

<details>
<summary><b>💻 Claude Code v IDE / Cursor</b></summary>

Cursor / VS Code Claude rozšíření čte `.mcp.json` v rootu workspace nebo `~/.cursor/mcp.json` (Cursor):

```json
{
  "mcpServers": {
    "strapi": {
      "command": "node",
      "args": ["/ABSOLUTNI/CESTA/strapi-io-mcp/dist/index.js"],
      "env": {
        "STRAPI_URL": "https://cms.mojefirma.cz",
        "STRAPI_API_TOKEN": "<vlozte-token>"
      }
    }
  }
}
```

</details>

<details>
<summary><b>🧪 OpenAI Codex CLI</b></summary>

Codex CLI (`codex`) podporuje MCP servery v `~/.codex/config.toml`:

```toml
[mcp_servers.strapi]
command = "node"
args = ["/ABSOLUTNI/CESTA/strapi-io-mcp/dist/index.js"]

[mcp_servers.strapi.env]
STRAPI_URL = "https://cms.mojefirma.cz"
STRAPI_API_TOKEN = "<vlozte-token>"
```

Pak v rámci Codex relace volejte tooly `strapi_*`.

</details>

<details>
<summary><b>💬 ChatGPT (OpenAI)</b></summary>

ChatGPT Desktop / Web má dva způsoby napojení MCP.

**1) Lokální MCP přes ChatGPT Desktop** *(macOS/Windows, Pro/Team/Enterprise)*

Otevřete **Settings → Connectors → Add MCP server** a vyplňte:

| Pole | Hodnota |
|---|---|
| Name | `strapi` |
| Command | `node` |
| Args | `/ABSOLUTNI/CESTA/strapi-io-mcp/dist/index.js` |
| Env: `STRAPI_URL` | `https://cms.mojefirma.cz` |
| Env: `STRAPI_API_TOKEN` | `<vlozte-token>` |

Uložte, povolte server v dialogu *Connectors* a v chatu zapněte **Developer mode** (umožní volat tools).

**2) Custom GPT / Actions (vzdálený přístup)**

ChatGPT Custom GPTs volají MCP servery nativně přes HTTP. Pro vystavení tohoto serveru na webu použijte `mcp-proxy` nebo `supergateway`:

```bash
npx -y supergateway --stdio "node /ABSOLUTNI/CESTA/strapi-io-mcp/dist/index.js" --port 8787
```

Pak v Custom GPT přidejte Action s `https://<vase-domena>:8787/sse`. Doporučujeme provoz za HTTPS reverse proxy s autorizací — viz [docs supergateway](https://github.com/supercorp-ai/supergateway).

</details>

---

## 🧰 Dostupné nástroje

Server publikuje **27 nástrojů**. Každý vrací JSON ze Strapi (chyby Strapi jsou propsány do MCP error odpovědi včetně těla).

### 📰 Collection types

| Tool | Endpoint | Účel |
|---|---|---|
| `strapi_list_entries` | `GET /api/:pluralApiId` | List entries s filtry / populate / sort / pagination / status / locale / fields |
| `strapi_get_entry` | `GET /api/:pluralApiId/:documentId` | Detail jednoho záznamu |
| `strapi_create_entry` | `POST /api/:pluralApiId` | Vytvořit entry (`status=draft` pro draft) |
| `strapi_update_entry` | `PUT /api/:pluralApiId/:documentId` | Částečný update — relations `connect`/`disconnect`/`set` |
| `strapi_delete_entry` | `DELETE /api/:pluralApiId/:documentId` | Smazat entry |
| `strapi_publish_entry` | PUT s `status=published` | Publikace draftu |
| `strapi_unpublish_entry` | PUT s `status=draft` | Despublikace |
| `strapi_count_entries` | `GET /api/:pluralApiId` | Vrací `pagination.total` pro daný filtr |

### 📄 Single types

| Tool | Endpoint | Účel |
|---|---|---|
| `strapi_get_single_type` | `GET /api/:singularApiId` | Načíst single type |
| `strapi_update_single_type` | `PUT /api/:singularApiId` | Update / vytvoření single type |
| `strapi_delete_single_type` | `DELETE /api/:singularApiId` | Smazat single type |

### 📁 Soubory (Upload plugin)

| Tool | Endpoint | Účel |
|---|---|---|
| `strapi_upload_file` | `POST /api/upload` | Multipart upload z `filePath` nebo `fileBase64` (volitelné `ref`/`refId`/`field`) |
| `strapi_list_files` | `GET /api/upload/files` | List souborů s filtry |
| `strapi_get_file` | `GET /api/upload/files/:id` | Detail souboru |
| `strapi_delete_file` | `DELETE /api/upload/files/:id` | Smazat soubor |
| `strapi_update_file_info` | `POST /api/upload?id=:id` | Update `name` / `alternativeText` / `caption` |

### 👤 Users-permissions

| Tool | Endpoint | Účel |
|---|---|---|
| `strapi_login` | `POST /api/auth/local` | Login — vrací JWT (cachuje se) |
| `strapi_register` | `POST /api/auth/local/register` | Registrace nového uživatele |
| `strapi_get_me` | `GET /api/users/me` | Aktuální přihlášený uživatel |
| `strapi_list_users` | `GET /api/users` | List uživatelů |
| `strapi_create_user` | `POST /api/users` | Vytvoření uživatele |
| `strapi_update_user` | `PUT /api/users/:id` | Update uživatele |
| `strapi_delete_user` | `DELETE /api/users/:id` | Smazat uživatele |

### 🌍 Meta / introspection

| Tool | Endpoint | Účel |
|---|---|---|
| `strapi_list_locales` | `GET /api/i18n/locales` | List nakonfigurovaných locales |
| `strapi_list_content_types` | `GET /content-type-builder/content-types` | Schémata content typů (admin práva) |
| `strapi_request` | *libovolný* | Generický REST escape hatch — `method`, `path`, `query`, `body`, `headers` |

---

## 💡 Příklady použití

<details open>
<summary><b>List published článků s filtry a populated obrázkem</b></summary>

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
    "locale": "cs"
  }
}
```

</details>

<details>
<summary><b>Vytvoření článku jako draft</b></summary>

```json
{
  "tool": "strapi_create_entry",
  "args": {
    "pluralApiId": "articles",
    "status": "draft",
    "data": {
      "title": "Nový článek",
      "slug": "novy-clanek",
      "body": "…"
    }
  }
}
```

</details>

<details>
<summary><b>Upload obrázku a připojení k článku</b></summary>

Strapi v5 vyžaduje **dvoukrokový** proces (upload souboru jako součást vytvoření entity už není podporován):

```json
// 1) upload
{
  "tool": "strapi_upload_file",
  "args": {
    "filePath": "/Users/me/Pictures/cover.jpg",
    "fileInfo": { "alternativeText": "Cover článku" }
  }
}
// → odpověď obsahuje [{ id: 42, ... }]

// 2) update entity s file id
{
  "tool": "strapi_update_entry",
  "args": {
    "pluralApiId": "articles",
    "documentId": "bw64dnu97i56nq85106yt4du",
    "data": { "cover": 42 }
  }
}
```

Alternativa — upload rovnou s vazbou v jednom kroku (entita musí již existovat):

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
<summary><b>Připojení / odpojení relace</b></summary>

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

## 🩺 Řešení problémů

| Symptom | Pravděpodobná příčina / oprava |
|---|---|
| `401 Unauthorized` | Token chybí nebo nemá práva. Zkontrolujte **Settings → API Tokens → Permissions**. |
| `404 Not Found` pro existující content type | Používáte správné `pluralApiId` (množné, kebab-case, např. `blog-posts`)? |
| Upload selhává s `413` | Strapi má limit velikosti uploadu (**Settings → Media Library**). Self-hosted: zvyšte v reverse proxy / Strapi configu. |
| Filtry se ignorují | Strapi defaultně povoluje filtry jen na `find` endpointech. Custom controllers musí být explicitně povoleny. |
| Server nestartuje v Claude Desktop | Zkontrolujte log: macOS `~/Library/Logs/Claude/mcp*.log`. Nejčastější chyba: špatná absolutní cesta nebo chybějící `node` v `PATH`. |

---

## 🤝 Příspěvky

Issues a pull requesty vítány na [github.com/pechondra/strapi-io-mcp](https://github.com/pechondra/strapi-io-mcp).

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

Pokud vám projekt pomohl, dejte mu prosím ⭐ na [GitHubu](https://github.com/pechondra/strapi-io-mcp).

</div>
