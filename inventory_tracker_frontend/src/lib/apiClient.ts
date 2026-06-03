import type { Product, ProductCreate, ProductUpdate } from "./types";

export class ApiError extends Error {
  status: number;
  bodyText?: string;

  constructor(message: string, status: number, bodyText?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.bodyText = bodyText;
  }
}

type ApiClientConfig = {
  baseUrl: string;
};

function joinUrl(baseUrl: string, path: string): string {
  const b = baseUrl.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

async function readErrorBody(res: Response): Promise<string | undefined> {
  try {
    const text = await res.text();
    return text || undefined;
  } catch {
    return undefined;
  }
}

async function requestJson<T>(
  url: string,
  init: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });

  if (!res.ok) {
    const bodyText = await readErrorBody(res);
    throw new ApiError(
      `Request failed (${res.status})`,
      res.status,
      bodyText
    );
  }

  if (res.status === 204) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return undefined as any as T;
  }

  return (await res.json()) as T;
}

export class ApiClient {
  private baseUrl: string;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
  }

  // PUBLIC_INTERFACE
  async listProducts(): Promise<Product[]> {
    /** Fetch all products. Expected backend route: GET /products */
    return await requestJson<Product[]>(joinUrl(this.baseUrl, "/products"), {
      method: "GET"
    });
  }

  // PUBLIC_INTERFACE
  async createProduct(payload: ProductCreate): Promise<Product> {
    /** Create a product. Expected backend route: POST /products */
    return await requestJson<Product>(joinUrl(this.baseUrl, "/products"), {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  // PUBLIC_INTERFACE
  async updateProduct(id: string, payload: ProductUpdate): Promise<Product> {
    /** Update a product. Expected backend route: PUT /products/{id} */
    return await requestJson<Product>(
      joinUrl(this.baseUrl, `/products/${encodeURIComponent(id)}`),
      {
        method: "PUT",
        body: JSON.stringify(payload)
      }
    );
  }

  // PUBLIC_INTERFACE
  async deleteProduct(id: string): Promise<void> {
    /** Delete a product. Expected backend route: DELETE /products/{id} */
    await requestJson<void>(
      joinUrl(this.baseUrl, `/products/${encodeURIComponent(id)}`),
      { method: "DELETE" }
    );
  }
}
