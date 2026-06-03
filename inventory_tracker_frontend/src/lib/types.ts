export type Product = {
  id: string;
  name: string;
  sku?: string | null;
  price?: number | null;
  quantity: number;
  updated_at?: string | null;
  created_at?: string | null;
};

export type ProductCreate = {
  name: string;
  sku?: string | null;
  price?: number | null;
  quantity: number;
};

export type ProductUpdate = {
  name?: string;
  sku?: string | null;
  price?: number | null;
  quantity?: number;
};
