import type { StrapiClient, StrapiQuery } from "./client.js";

export interface ToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>, client: StrapiClient) => Promise<unknown>;
}

const queryProps = {
  fields: { type: "array", items: { type: "string" }, description: "Specific fields to return" },
  filters: {
    type: "object",
    additionalProperties: true,
    description:
      "Filter object using Strapi operators ($eq, $ne, $lt, $gt, $contains, $in, $or, $and, $not, etc.). Example: {\"title\":{\"$contains\":\"hello\"}}",
  },
  populate: {
    description:
      "Populate relations/components/dynamic zones. Use '*' for all, an array of names, or an object for nested control.",
  },
  sort: {
    description: "Sort string or array, e.g. 'title:asc' or ['createdAt:desc','title:asc']",
  },
  pagination: {
    type: "object",
    description: "Pagination object: {page, pageSize} or {start, limit, withCount}",
    additionalProperties: true,
  },
  status: {
    type: "string",
    enum: ["draft", "published"],
    description: "Draft & Publish status filter",
  },
  locale: { type: "string", description: "Locale code, e.g. 'en', 'cs'" },
  publicationState: {
    type: "string",
    enum: ["live", "preview"],
    description: "Legacy publication state (live = published, preview = all)",
  },
};

function pickQuery(args: Record<string, unknown>): StrapiQuery {
  const out: StrapiQuery = {};
  for (const k of ["fields", "filters", "populate", "sort", "pagination", "status", "locale", "publicationState"]) {
    if (args[k] !== undefined) (out as Record<string, unknown>)[k] = args[k];
  }
  return out;
}

export const TOOLS: ToolDef[] = [
  {
    name: "strapi_list_entries",
    description:
      "List entries (documents) of a collection type. Returns paginated result. Supports filters, populate, sort, pagination, status, locale.",
    inputSchema: {
      type: "object",
      properties: {
        pluralApiId: {
          type: "string",
          description: "Plural API ID of the collection, e.g. 'articles', 'restaurants'",
        },
        ...queryProps,
      },
      required: ["pluralApiId"],
      additionalProperties: false,
    },
    handler: async (args, c) => {
      const id = String(args.pluralApiId);
      return c.request("GET", `/api/${id}`, { query: pickQuery(args) });
    },
  },
  {
    name: "strapi_get_entry",
    description: "Get a single entry by documentId from a collection type.",
    inputSchema: {
      type: "object",
      properties: {
        pluralApiId: { type: "string" },
        documentId: { type: "string", description: "documentId of the entry (Strapi v5)" },
        ...queryProps,
      },
      required: ["pluralApiId", "documentId"],
      additionalProperties: false,
    },
    handler: async (args, c) => {
      return c.request("GET", `/api/${args.pluralApiId}/${args.documentId}`, {
        query: pickQuery(args),
      });
    },
  },
  {
    name: "strapi_create_entry",
    description:
      "Create a new entry in a collection type. By default created as published; pass status='draft' to create as draft. Use 'data' for fields, including connect/disconnect/set for relations and uploaded file IDs for media.",
    inputSchema: {
      type: "object",
      properties: {
        pluralApiId: { type: "string" },
        data: {
          type: "object",
          additionalProperties: true,
          description: "Entry fields. For relations: {field:{connect:[id]}}. For media: {field: fileId or [fileIds]}.",
        },
        status: { type: "string", enum: ["draft", "published"] },
        locale: { type: "string" },
        populate: queryProps.populate,
        fields: queryProps.fields,
      },
      required: ["pluralApiId", "data"],
      additionalProperties: false,
    },
    handler: async (args, c) => {
      const query: StrapiQuery = {};
      if (args.status) query.status = args.status as StrapiQuery["status"];
      if (args.locale) query.locale = String(args.locale);
      if (args.populate !== undefined) query.populate = args.populate;
      if (args.fields !== undefined) query.fields = args.fields as string[];
      return c.request("POST", `/api/${args.pluralApiId}`, {
        body: { data: args.data },
        query,
      });
    },
  },
  {
    name: "strapi_update_entry",
    description:
      "Partially update an entry by documentId. Only included fields change. Supports relation operators connect/disconnect/set.",
    inputSchema: {
      type: "object",
      properties: {
        pluralApiId: { type: "string" },
        documentId: { type: "string" },
        data: { type: "object", additionalProperties: true },
        status: { type: "string", enum: ["draft", "published"] },
        locale: { type: "string" },
        populate: queryProps.populate,
        fields: queryProps.fields,
      },
      required: ["pluralApiId", "documentId", "data"],
      additionalProperties: false,
    },
    handler: async (args, c) => {
      const query: StrapiQuery = {};
      if (args.status) query.status = args.status as StrapiQuery["status"];
      if (args.locale) query.locale = String(args.locale);
      if (args.populate !== undefined) query.populate = args.populate;
      if (args.fields !== undefined) query.fields = args.fields as string[];
      return c.request("PUT", `/api/${args.pluralApiId}/${args.documentId}`, {
        body: { data: args.data },
        query,
      });
    },
  },
  {
    name: "strapi_delete_entry",
    description: "Delete an entry by documentId from a collection type.",
    inputSchema: {
      type: "object",
      properties: {
        pluralApiId: { type: "string" },
        documentId: { type: "string" },
        locale: { type: "string" },
      },
      required: ["pluralApiId", "documentId"],
      additionalProperties: false,
    },
    handler: async (args, c) => {
      const query: StrapiQuery = {};
      if (args.locale) query.locale = String(args.locale);
      return c.request("DELETE", `/api/${args.pluralApiId}/${args.documentId}`, { query });
    },
  },
  {
    name: "strapi_publish_entry",
    description:
      "Publish a draft entry. Implemented as PUT with status='published'. Provide the documentId.",
    inputSchema: {
      type: "object",
      properties: {
        pluralApiId: { type: "string" },
        documentId: { type: "string" },
        locale: { type: "string" },
      },
      required: ["pluralApiId", "documentId"],
      additionalProperties: false,
    },
    handler: async (args, c) => {
      const query: StrapiQuery = { status: "published" };
      if (args.locale) query.locale = String(args.locale);
      return c.request("PUT", `/api/${args.pluralApiId}/${args.documentId}`, {
        body: { data: {} },
        query,
      });
    },
  },
  {
    name: "strapi_unpublish_entry",
    description: "Unpublish an entry. Implemented as PUT with status='draft'. Provide the documentId.",
    inputSchema: {
      type: "object",
      properties: {
        pluralApiId: { type: "string" },
        documentId: { type: "string" },
        locale: { type: "string" },
      },
      required: ["pluralApiId", "documentId"],
      additionalProperties: false,
    },
    handler: async (args, c) => {
      const query: StrapiQuery = { status: "draft" };
      if (args.locale) query.locale = String(args.locale);
      return c.request("PUT", `/api/${args.pluralApiId}/${args.documentId}`, {
        body: { data: {} },
        query,
      });
    },
  },
  {
    name: "strapi_get_single_type",
    description: "Get a single type entry by its singular API ID.",
    inputSchema: {
      type: "object",
      properties: {
        singularApiId: { type: "string", description: "Singular API ID, e.g. 'homepage'" },
        ...queryProps,
      },
      required: ["singularApiId"],
      additionalProperties: false,
    },
    handler: async (args, c) => {
      return c.request("GET", `/api/${args.singularApiId}`, { query: pickQuery(args) });
    },
  },
  {
    name: "strapi_update_single_type",
    description: "Update or create a single type entry. Body must contain {data: {...}}.",
    inputSchema: {
      type: "object",
      properties: {
        singularApiId: { type: "string" },
        data: { type: "object", additionalProperties: true },
        status: { type: "string", enum: ["draft", "published"] },
        locale: { type: "string" },
        populate: queryProps.populate,
      },
      required: ["singularApiId", "data"],
      additionalProperties: false,
    },
    handler: async (args, c) => {
      const query: StrapiQuery = {};
      if (args.status) query.status = args.status as StrapiQuery["status"];
      if (args.locale) query.locale = String(args.locale);
      if (args.populate !== undefined) query.populate = args.populate;
      return c.request("PUT", `/api/${args.singularApiId}`, {
        body: { data: args.data },
        query,
      });
    },
  },
  {
    name: "strapi_delete_single_type",
    description: "Delete a single type entry.",
    inputSchema: {
      type: "object",
      properties: {
        singularApiId: { type: "string" },
        locale: { type: "string" },
      },
      required: ["singularApiId"],
      additionalProperties: false,
    },
    handler: async (args, c) => {
      const query: StrapiQuery = {};
      if (args.locale) query.locale = String(args.locale);
      return c.request("DELETE", `/api/${args.singularApiId}`, { query });
    },
  },
  {
    name: "strapi_count_entries",
    description: "Count entries matching filters. Uses pagination.withCount and pageSize=1 to read pagination.total.",
    inputSchema: {
      type: "object",
      properties: {
        pluralApiId: { type: "string" },
        filters: queryProps.filters,
        status: queryProps.status,
        locale: queryProps.locale,
      },
      required: ["pluralApiId"],
      additionalProperties: false,
    },
    handler: async (args, c) => {
      const query: StrapiQuery = {
        pagination: { page: 1, pageSize: 1, withCount: true },
        fields: ["id"],
      };
      if (args.filters) query.filters = args.filters as StrapiQuery["filters"];
      if (args.status) query.status = args.status as StrapiQuery["status"];
      if (args.locale) query.locale = String(args.locale);
      const res = (await c.request<{ meta?: { pagination?: { total?: number } } }>(
        "GET",
        `/api/${args.pluralApiId}`,
        { query },
      )) ?? {};
      return { total: res?.meta?.pagination?.total ?? 0, raw: res };
    },
  },
  {
    name: "strapi_upload_file",
    description:
      "Upload a file to Strapi's media library. Provide either filePath (absolute path on server) or fileBase64. Optionally link to an entry via ref/refId/field. Returns array of uploaded file objects with their IDs.",
    inputSchema: {
      type: "object",
      properties: {
        filePath: { type: "string", description: "Absolute path to the file on the local filesystem" },
        fileBase64: { type: "string", description: "Base64-encoded file content" },
        fileName: { type: "string", description: "Filename to use (required when using fileBase64)" },
        mimeType: { type: "string", description: "MIME type override" },
        ref: { type: "string", description: "Content type UID, e.g. 'api::article.article'" },
        refId: {
          type: ["string", "number"],
          description: "ID (numeric) or documentId of the related entry",
        },
        field: { type: "string", description: "Field name on the related entry to attach the file to" },
        fileInfo: {
          type: "object",
          properties: {
            name: { type: "string" },
            alternativeText: { type: "string" },
            caption: { type: "string" },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    handler: async (args, c) => {
      return c.uploadFile({
        filePath: args.filePath as string | undefined,
        fileBase64: args.fileBase64 as string | undefined,
        fileName: args.fileName as string | undefined,
        mimeType: args.mimeType as string | undefined,
        ref: args.ref as string | undefined,
        refId: args.refId as string | number | undefined,
        field: args.field as string | undefined,
        fileInfo: args.fileInfo as { name?: string; alternativeText?: string; caption?: string } | undefined,
      });
    },
  },
  {
    name: "strapi_list_files",
    description: "List files in the media library. Supports Strapi filters/sort/pagination.",
    inputSchema: {
      type: "object",
      properties: {
        filters: queryProps.filters,
        sort: queryProps.sort,
        pagination: queryProps.pagination,
        fields: queryProps.fields,
      },
      additionalProperties: false,
    },
    handler: async (args, c) => {
      return c.request("GET", "/api/upload/files", { query: pickQuery(args) });
    },
  },
  {
    name: "strapi_get_file",
    description: "Get a specific file from the media library by its numeric id.",
    inputSchema: {
      type: "object",
      properties: { id: { type: ["string", "number"] } },
      required: ["id"],
      additionalProperties: false,
    },
    handler: async (args, c) => {
      return c.request("GET", `/api/upload/files/${args.id}`);
    },
  },
  {
    name: "strapi_delete_file",
    description: "Delete a file from the media library by its numeric id.",
    inputSchema: {
      type: "object",
      properties: { id: { type: ["string", "number"] } },
      required: ["id"],
      additionalProperties: false,
    },
    handler: async (args, c) => {
      return c.request("DELETE", `/api/upload/files/${args.id}`);
    },
  },
  {
    name: "strapi_update_file_info",
    description: "Update metadata of a file (name, alternativeText, caption).",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: ["string", "number"] },
        fileInfo: {
          type: "object",
          properties: {
            name: { type: "string" },
            alternativeText: { type: "string" },
            caption: { type: "string" },
          },
          additionalProperties: false,
        },
      },
      required: ["id", "fileInfo"],
      additionalProperties: false,
    },
    handler: async (args, c) => {
      return c.updateFileInfo(
        args.id as string | number,
        args.fileInfo as { name?: string; alternativeText?: string; caption?: string },
      );
    },
  },
  {
    name: "strapi_login",
    description:
      "Login via users-permissions plugin (POST /api/auth/local). Returns user and JWT. Cached and used as bearer for subsequent requests.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: { type: "string", description: "email or username" },
        password: { type: "string" },
      },
      required: ["identifier", "password"],
      additionalProperties: false,
    },
    handler: async (args, c) => c.login(String(args.identifier), String(args.password)),
  },
  {
    name: "strapi_register",
    description: "Register a new user via users-permissions plugin (POST /api/auth/local/register).",
    inputSchema: {
      type: "object",
      properties: {
        username: { type: "string" },
        email: { type: "string" },
        password: { type: "string" },
      },
      required: ["username", "email", "password"],
      additionalProperties: false,
    },
    handler: async (args, c) =>
      c.register({
        username: String(args.username),
        email: String(args.email),
        password: String(args.password),
      }),
  },
  {
    name: "strapi_get_me",
    description: "Get the currently authenticated user (GET /api/users/me).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: async (_args, c) => c.request("GET", "/api/users/me"),
  },
  {
    name: "strapi_list_users",
    description: "List users from users-permissions plugin (GET /api/users).",
    inputSchema: {
      type: "object",
      properties: {
        filters: queryProps.filters,
        sort: queryProps.sort,
        pagination: queryProps.pagination,
        fields: queryProps.fields,
        populate: queryProps.populate,
      },
      additionalProperties: false,
    },
    handler: async (args, c) => c.request("GET", "/api/users", { query: pickQuery(args) }),
  },
  {
    name: "strapi_create_user",
    description: "Create a new user (POST /api/users) — requires admin token / proper permissions.",
    inputSchema: {
      type: "object",
      properties: {
        username: { type: "string" },
        email: { type: "string" },
        password: { type: "string" },
        role: { type: ["string", "number"], description: "Role id" },
        confirmed: { type: "boolean" },
        blocked: { type: "boolean" },
      },
      required: ["username", "email", "password"],
      additionalProperties: true,
    },
    handler: async (args, c) => c.request("POST", "/api/users", { body: args }),
  },
  {
    name: "strapi_update_user",
    description: "Update a user by numeric id (PUT /api/users/:id).",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: ["string", "number"] },
        data: { type: "object", additionalProperties: true },
      },
      required: ["id", "data"],
      additionalProperties: false,
    },
    handler: async (args, c) => c.request("PUT", `/api/users/${args.id}`, { body: args.data }),
  },
  {
    name: "strapi_delete_user",
    description: "Delete a user by numeric id (DELETE /api/users/:id).",
    inputSchema: {
      type: "object",
      properties: { id: { type: ["string", "number"] } },
      required: ["id"],
      additionalProperties: false,
    },
    handler: async (args, c) => c.request("DELETE", `/api/users/${args.id}`),
  },
  {
    name: "strapi_request",
    description:
      "Generic Strapi REST request escape hatch. Use when no dedicated tool fits — e.g. custom routes, plugin endpoints, /api/users-permissions/roles, /api/i18n/locales, /api/content-type-builder/*, etc.",
    inputSchema: {
      type: "object",
      properties: {
        method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE", "PATCH"] },
        path: {
          type: "string",
          description: "Path beginning with '/'. Example: '/api/users-permissions/roles'",
        },
        query: { type: "object", additionalProperties: true },
        body: { description: "Request body (object will be JSON-stringified)" },
        headers: { type: "object", additionalProperties: { type: "string" } },
      },
      required: ["method", "path"],
      additionalProperties: false,
    },
    handler: async (args, c) =>
      c.request(String(args.method), String(args.path), {
        query: args.query as StrapiQuery | undefined,
        body: args.body,
        headers: args.headers as Record<string, string> | undefined,
      }),
  },
  {
    name: "strapi_list_locales",
    description: "List i18n locales configured on the Strapi instance.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: async (_args, c) => c.request("GET", "/api/i18n/locales"),
  },
  {
    name: "strapi_list_content_types",
    description:
      "List content type schemas (requires admin permissions on /content-type-builder/content-types).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    handler: async (_args, c) => c.request("GET", "/content-type-builder/content-types"),
  },
];
