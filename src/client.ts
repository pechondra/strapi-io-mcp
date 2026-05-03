import { request, FormData, fetch } from "undici";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import qs from "qs";
import type { StrapiConfig } from "./config.js";

export class StrapiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "StrapiError";
    this.status = status;
    this.body = body;
  }
}

export interface StrapiQuery {
  fields?: string[];
  filters?: Record<string, unknown>;
  populate?: unknown;
  sort?: string | string[];
  pagination?: {
    page?: number;
    pageSize?: number;
    start?: number;
    limit?: number;
    withCount?: boolean;
  };
  status?: "draft" | "published";
  locale?: string;
  publicationState?: "live" | "preview";
  [key: string]: unknown;
}

export class StrapiClient {
  private cachedJwt: string | undefined;

  constructor(private readonly config: StrapiConfig) {}

  private async getAuthHeader(): Promise<string | undefined> {
    if (this.config.apiToken) return `Bearer ${this.config.apiToken}`;
    if (this.config.email && this.config.password) {
      if (!this.cachedJwt) {
        this.cachedJwt = await this.loginAndGetJwt(this.config.email, this.config.password);
      }
      return `Bearer ${this.cachedJwt}`;
    }
    return undefined;
  }

  private buildUrl(path: string, query?: StrapiQuery): string {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    const base = `${this.config.url}${normalized}`;
    if (!query || Object.keys(query).length === 0) return base;
    const qsString = qs.stringify(query, { encodeValuesOnly: true });
    return qsString ? `${base}?${qsString}` : base;
  }

  async request<T = unknown>(
    method: string,
    path: string,
    options: {
      query?: StrapiQuery;
      body?: unknown;
      headers?: Record<string, string>;
      raw?: boolean;
      skipAuth?: boolean;
    } = {},
  ): Promise<T> {
    const url = this.buildUrl(path, options.query);
    const headers: Record<string, string> = { ...(options.headers ?? {}) };
    if (!options.skipAuth) {
      const auth = await this.getAuthHeader();
      if (auth) headers["Authorization"] = auth;
    }

    let body: string | Buffer | undefined;
    if (options.body !== undefined && options.body !== null) {
      if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
      body = headers["Content-Type"]?.includes("application/json")
        ? JSON.stringify(options.body)
        : (options.body as string | Buffer);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      const res = await request(url, {
        method: method as never,
        headers,
        body,
        signal: controller.signal,
      });
      const text = await res.body.text();
      const parsed = parseJsonSafe(text);
      if (res.statusCode >= 400) {
        throw new StrapiError(
          `Strapi ${method} ${path} failed: ${res.statusCode}`,
          res.statusCode,
          parsed ?? text,
        );
      }
      return (options.raw ? text : (parsed ?? text)) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  private async loginAndGetJwt(identifier: string, password: string): Promise<string> {
    const url = `${this.config.url}/api/auth/local`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const text = await res.text();
    const parsed = parseJsonSafe(text);
    if (!res.ok) {
      throw new StrapiError("Strapi login failed", res.status, parsed ?? text);
    }
    const jwt = (parsed as { jwt?: string } | null)?.jwt;
    if (!jwt) throw new StrapiError("Strapi login: no JWT in response", res.status, parsed);
    return jwt;
  }

  async login(identifier: string, password: string): Promise<unknown> {
    const result = await this.request<{ jwt?: string; user?: unknown }>("POST", "/api/auth/local", {
      body: { identifier, password },
      skipAuth: true,
    });
    if (result?.jwt) this.cachedJwt = result.jwt;
    return result;
  }

  async register(input: { username: string; email: string; password: string }): Promise<unknown> {
    return this.request("POST", "/api/auth/local/register", { body: input, skipAuth: true });
  }

  async uploadFile(args: {
    filePath?: string;
    fileBase64?: string;
    fileName?: string;
    mimeType?: string;
    ref?: string;
    refId?: string | number;
    field?: string;
    fileInfo?: { name?: string; alternativeText?: string; caption?: string };
  }): Promise<unknown> {
    const form = new FormData();
    let buffer: Uint8Array;
    let name: string;
    let type: string;

    if (args.filePath) {
      buffer = await readFile(args.filePath);
      name = args.fileName ?? basename(args.filePath);
      type = args.mimeType ?? guessMime(name);
    } else if (args.fileBase64) {
      buffer = Buffer.from(args.fileBase64, "base64");
      name = args.fileName ?? "upload.bin";
      type = args.mimeType ?? guessMime(name);
    } else {
      throw new Error("upload_file requires filePath or fileBase64");
    }

    const blob = new Blob([buffer], { type });
    form.append("files", blob, name);
    if (args.ref) form.append("ref", args.ref);
    if (args.refId !== undefined) form.append("refId", String(args.refId));
    if (args.field) form.append("field", args.field);
    if (args.fileInfo) form.append("fileInfo", JSON.stringify(args.fileInfo));

    const headers: Record<string, string> = {};
    const auth = await this.getAuthHeader();
    if (auth) headers["Authorization"] = auth;

    const res = await fetch(`${this.config.url}/api/upload`, {
      method: "POST",
      headers,
      body: form,
    });
    const text = await res.text();
    const parsed = parseJsonSafe(text);
    if (!res.ok) throw new StrapiError("Strapi upload failed", res.status, parsed ?? text);
    return parsed ?? text;
  }

  async updateFileInfo(
    fileId: number | string,
    fileInfo: { name?: string; alternativeText?: string; caption?: string },
  ): Promise<unknown> {
    const form = new FormData();
    form.append("fileInfo", JSON.stringify(fileInfo));
    const headers: Record<string, string> = {};
    const auth = await this.getAuthHeader();
    if (auth) headers["Authorization"] = auth;
    const res = await fetch(`${this.config.url}/api/upload?id=${encodeURIComponent(String(fileId))}`, {
      method: "POST",
      headers,
      body: form,
    });
    const text = await res.text();
    const parsed = parseJsonSafe(text);
    if (!res.ok) throw new StrapiError("Strapi update fileInfo failed", res.status, parsed ?? text);
    return parsed ?? text;
  }
}

function parseJsonSafe(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

const MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  json: "application/json",
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  mp4: "video/mp4",
  mp3: "audio/mpeg",
  zip: "application/zip",
};

function guessMime(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  return (ext && MIME_BY_EXT[ext]) || "application/octet-stream";
}
