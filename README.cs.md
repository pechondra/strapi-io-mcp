# strapi-io-mcp

> 🇬🇧 **English version:** [README.md](./README.md)

Lokální MCP (Model Context Protocol) server pro **Strapi v5** (testováno proti Strapi `5.43.x`, REST API). Kompletně pokrývá obsah, soubory, single types, i18n, draft/publish a uživatele.

Funguje s libovolnou Strapi instancí — **cloud i self-hosted** — pomocí konfigurace přes proměnné prostředí (`STRAPI_URL`, `STRAPI_API_TOKEN`).

---

## Obsah

- [Vlastnosti](#vlastnosti)
- [Instalace](#instalace)
- [Konfigurace (Strapi)](#konfigurace-strapi)
- [Konfigurace (MCP klienti)](#konfigurace-mcp-klientů)
  - [Claude Desktop](#claude-desktop)
  - [Claude Code (CLI)](#claude-code-cli)
  - [Claude Code v IDE / Cursor](#claude-code-v-ide--cursor)
  - [OpenAI Codex CLI](#openai-codex-cli)
  - [ChatGPT (OpenAI)](#chatgpt-openai)
- [Dostupné nástroje](#dostupné-nástroje)
- [Příklady použití](#příklady-použití)
- [Řešení problémů](#řešení-problémů)

---

## Vlastnosti

- **CRUD obsahu** pro collection types i single types (Strapi v5 `documentId`).
- **Upload souborů** — z lokální cesty nebo base64; možnost rovnou připojit k existující entitě (`ref`/`refId`/`field`).
- **Správa media library** — listování, mazání, úprava metadat (alt text, caption…).
- **Filtry, populate, sort, pagination, fields** — plná podpora Strapi REST query parametrů včetně `LHS bracket` syntaxe (přes `qs`).
- **Draft & Publish** — `status=draft|published`, dedikované `publish`/`unpublish` toolky.
- **i18n** — `locale` parametr a tool pro výpis všech locales.
- **Auth** — buď API token z admin panelu, nebo users-permissions JWT (login/register/me).
- **Users-permissions** — list/create/update/delete uživatelů.
- **Generický escape-hatch** (`strapi_request`) — libovolný REST endpoint (custom routes, content-type-builder, role, plugin endpointy…).
- **Self-hosted ready** — konfigurovatelný `base URL`, timeout i typ autentizace.

---

## Instalace

> Vyžaduje **Node.js ≥ 18** a `git`.

### A) Z GitHubu — clone + build (doporučeno)

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

Tuto cestu pak vložíte do konfigurace MCP klienta (viz dále).

### B) Globální instalace přímo z GitHubu

```bash
npm install -g github:pechondra/strapi-io-mcp
```

Tím se nainstaluje příkaz `strapi-io-mcp` do PATH (skript `prepare` v `package.json` automaticky spustí build). V konfiguraci MCP klienta pak místo `node /cesta/dist/index.js` použijete:

```json
{ "command": "strapi-io-mcp", "args": [] }
```

Konkrétní cestu k binárce můžete ověřit přes `which strapi-io-mcp`.

### C) Bez instalace přes `npx`

```bash
npx -y github:pechondra/strapi-io-mcp
```

A v konfiguraci MCP klienta:

```json
{
  "command": "npx",
  "args": ["-y", "github:pechondra/strapi-io-mcp"]
}
```

> ⚠️ U `npx` z GitHubu si první spuštění stáhne a vybuilduje balíček (může chvíli trvat). Pro produkční / opakované použití preferujte variantu A nebo B.

### Aktualizace

```bash
# varianta A (clone)
cd strapi-io-mcp && git pull && npm install && npm run build

# varianta B (globální)
npm install -g github:pechondra/strapi-io-mcp
```

---

## Konfigurace (Strapi)

Server čte následující proměnné prostředí. Stačí nastavit pomocí MCP klienta (viz níže), případně přes shell.

| Proměnná | Povinné | Default | Popis |
|---|---|---|---|
| `STRAPI_URL` | ano | `http://localhost:1337` | Base URL vaší Strapi instance, **bez koncového lomítka**. Pro self-hosted např. `https://cms.mojefirma.cz`. |
| `STRAPI_API_TOKEN` | doporučené | — | API token z admin panelu. **Settings → API Tokens → Create new**. Doporučený typ: `Full access` (pro všechny operace) nebo `Custom` s vybranými právy. |
| `STRAPI_EMAIL` | volitelné | — | Email pro users-permissions login (alternativa k API tokenu). |
| `STRAPI_PASSWORD` | volitelné | — | Heslo pro users-permissions login. |
| `STRAPI_TIMEOUT_MS` | volitelné | `30000` | HTTP timeout v ms. |

**Doporučení:** používejte `STRAPI_API_TOKEN`. Login přes email/heslo je vhodný spíš pro testování/uživatelské scénáře.

> Pokud Strapi instance vyžaduje **Custom API token**, nezapomeňte tokenu povolit operace na `Upload`, `Users-Permissions`, `Content-Type-Builder` a všechny content typy, se kterými chcete pracovat. Bez `Full access` token nedotáhne třeba `strapi_list_content_types`.

---

## Konfigurace (MCP klientů)

Cesta k binárce v příkladech: `/ABSOLUTNI/CESTA/strapi-io-mcp/dist/index.js`. Nahraďte ji vaší skutečnou cestou (z `pwd` v projektu).

### Claude Desktop

Konfigurační soubor:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

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

### Claude Code (CLI)

Nejjednodušší způsob — přidat přes CLI:

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

### Claude Code v IDE / Cursor

Cursor / VS Code Claude rozšíření čte `.mcp.json` v rootu workspace nebo `~/.cursor/mcp.json` (pro Cursor):

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

### OpenAI Codex CLI

Codex CLI (`codex`) podporuje MCP servery v `~/.codex/config.toml`:

```toml
[mcp_servers.strapi]
command = "node"
args = ["/ABSOLUTNI/CESTA/strapi-io-mcp/dist/index.js"]

[mcp_servers.strapi.env]
STRAPI_URL = "https://cms.mojefirma.cz"
STRAPI_API_TOKEN = "<vlozte-token>"
```

Pak v rámci Codex relace zavolejte tool `strapi_*`.

### ChatGPT (OpenAI)

ChatGPT Desktop / web má dva způsoby napojení MCP:

**1) Lokální MCP přes ChatGPT Desktop (macOS/Windows, Pro/Team/Enterprise)**

Otevřete **Settings → Connectors → Add MCP server**, vyplňte:

- *Name*: `strapi`
- *Command*: `node`
- *Args*: `/ABSOLUTNI/CESTA/strapi-io-mcp/dist/index.js`
- *Environment*:
  - `STRAPI_URL` = `https://cms.mojefirma.cz`
  - `STRAPI_API_TOKEN` = `<vlozte-token>`

Po uložení povolte server v dialogu *Connectors* a v chatu zapněte **Developer mode** (umožní volat tools).

**2) Přes Custom GPT / Actions (vzdálený přístup)**

ChatGPT Custom GPTs nativně volají MCP servery přes HTTP. Pokud chcete tento server expozovat přes web, obalíte ho `mcp-proxy` nebo `supergateway`:

```bash
npx -y supergateway --stdio "node /ABSOLUTNI/CESTA/strapi-io-mcp/dist/index.js" --port 8787
```

…a pak v Custom GPT přidejte Action s `https://<vaše-doména>:8787/sse`. (Doporučujeme provoz za HTTPS reverse proxy a s autorizací, viz [docs supergateway](https://github.com/supercorp-ai/supergateway).)

---

## Dostupné nástroje

Server publikuje **27 nástrojů**. Všechny vrací JSON ze Strapi (chyby Strapi propojuje do MCP error odpovědi včetně těla).

### Obsah — collection types

| Tool | Popis |
|---|---|
| `strapi_list_entries` | `GET /api/:pluralApiId` — list entries s podporou `filters`, `populate`, `sort`, `pagination`, `status`, `locale`, `fields`. |
| `strapi_get_entry` | `GET /api/:pluralApiId/:documentId` — detail jednoho záznamu. |
| `strapi_create_entry` | `POST /api/:pluralApiId` — vytvořit entry. Default `published`, lze `status=draft`. |
| `strapi_update_entry` | `PUT /api/:pluralApiId/:documentId` — částečný update (relations: `connect`/`disconnect`/`set`). |
| `strapi_delete_entry` | `DELETE /api/:pluralApiId/:documentId`. |
| `strapi_publish_entry` | Publikace draftu (PUT s `status=published`). |
| `strapi_unpublish_entry` | Despublikace (PUT s `status=draft`). |
| `strapi_count_entries` | Vrací `pagination.total` pro daný filtr. |

### Obsah — single types

| Tool | Popis |
|---|---|
| `strapi_get_single_type` | `GET /api/:singularApiId`. |
| `strapi_update_single_type` | `PUT /api/:singularApiId`. |
| `strapi_delete_single_type` | `DELETE /api/:singularApiId`. |

### Soubory (Upload plugin)

| Tool | Popis |
|---|---|
| `strapi_upload_file` | `POST /api/upload` — multipart upload z `filePath` nebo `fileBase64`. Volitelně připojí k entitě (`ref`/`refId`/`field`). |
| `strapi_list_files` | `GET /api/upload/files` — list souborů s filtry. |
| `strapi_get_file` | `GET /api/upload/files/:id`. |
| `strapi_delete_file` | `DELETE /api/upload/files/:id`. |
| `strapi_update_file_info` | `POST /api/upload?id=:id` — update `name`/`alternativeText`/`caption`. |

### Auth & uživatelé (users-permissions)

| Tool | Popis |
|---|---|
| `strapi_login` | `POST /api/auth/local` — vrací JWT (cachuje se pro další volání). |
| `strapi_register` | `POST /api/auth/local/register`. |
| `strapi_get_me` | `GET /api/users/me`. |
| `strapi_list_users` | `GET /api/users`. |
| `strapi_create_user` | `POST /api/users`. |
| `strapi_update_user` | `PUT /api/users/:id`. |
| `strapi_delete_user` | `DELETE /api/users/:id`. |

### Meta / introspection

| Tool | Popis |
|---|---|
| `strapi_list_locales` | `GET /api/i18n/locales`. |
| `strapi_list_content_types` | `GET /content-type-builder/content-types` (vyžaduje admin práva). |
| `strapi_request` | Generický REST escape-hatch — `method`, `path`, `query`, `body`, `headers`. Použijte pro custom routes a všechno ostatní. |

---

## Příklady použití

### List published článků s filtry a populated obrázkem

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

### Vytvoření článku jako draft

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

### Upload obrázku a připojení k článku

Strapi v5 vyžaduje **dvoukrokový** proces (file upload nelze provést přímo při vytvoření entity):

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

// 2) update entity s odkazem na file id
{
  "tool": "strapi_update_entry",
  "args": {
    "pluralApiId": "articles",
    "documentId": "bw64dnu97i56nq85106yt4du",
    "data": { "cover": 42 }
  }
}
```

Alternativa — upload rovnou s vazbou (jeden krok, ale entita musí už existovat):

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

### Připojení/odpojení relace

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

## Řešení problémů

- **`401 Unauthorized`** — token nemá práva nebo není nastaven. Zkontrolujte v Strapi admin panelu *Settings → API Tokens → Permissions*.
- **`404 Not Found` pro existující content type** — používáte správné `pluralApiId` (množné, kebab-case, např. `blog-posts`)?
- **Upload selhává s `413`** — Strapi má limit velikosti uploadu (`Settings → Media Library`). U self-hosted zvyšte v reverse proxy / Strapi konfiguraci.
- **Filtry se ignorují** — Strapi defaultně povoluje filtry jen na `find` endpointech. U custom controllers musí být explicitně povoleny.
- **Server nestartuje v Claude Desktop** — zkontrolujte log: macOS `~/Library/Logs/Claude/mcp*.log`. Nejčastější chyba je špatná absolutní cesta nebo chybějící `node` v PATH.

---

## Licence

MIT
