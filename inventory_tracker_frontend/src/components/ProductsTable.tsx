import React, { useMemo, useState } from "react";
import type { Product } from "../lib/types";

type Props = {
  loading: boolean;
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

function formatMoney(value?: number | null): string {
  if (value === null || value === undefined) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD"
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

export function ProductsTable(props: Props) {
  const { loading, products, onEdit, onDelete } = props;

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;

    return products.filter((p) => {
      const name = p.name?.toLowerCase() || "";
      const sku = p.sku?.toLowerCase() || "";
      return name.includes(q) || sku.includes(q);
    });
  }, [products, query]);

  return (
    <section className="card">
      <div className="cardHeader">
        <div>
          <div className="cardTitle">Products</div>
          <div className="cardSubtitle">
            {loading
              ? "Loading…"
              : `${filtered.length} product${filtered.length === 1 ? "" : "s"}`}
          </div>
        </div>

        <div className="cardActions">
          <label className="inputWrap">
            <span className="inputLabel">Search</span>
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or SKU…"
            />
          </label>
        </div>
      </div>

      <div className="tableWrap" role="region" aria-label="Products table">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: "38%" }}>Name</th>
              <th style={{ width: "18%" }}>SKU</th>
              <th style={{ width: "16%" }}>Price</th>
              <th style={{ width: "14%" }}>Quantity</th>
              <th style={{ width: "14%" }} aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="mutedCell">
                  Loading products…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="mutedCell">
                  No products found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="cellMain">{p.name}</div>
                    <div className="cellSub">
                      {p.updated_at ? `Updated ${p.updated_at}` : ""}
                    </div>
                  </td>
                  <td>{p.sku || "—"}</td>
                  <td>{formatMoney(p.price)}</td>
                  <td>
                    <span
                      className={
                        p.quantity <= 0
                          ? "badge badgeDanger"
                          : p.quantity <= 5
                            ? "badge badgeWarn"
                            : "badge badgeOk"
                      }
                      title={
                        p.quantity <= 0
                          ? "Out of stock"
                          : p.quantity <= 5
                            ? "Low stock"
                            : "In stock"
                      }
                    >
                      {p.quantity}
                    </span>
                  </td>
                  <td className="actionsCell">
                    <button className="btn btnSmall" onClick={() => onEdit(p)}>
                      Edit
                    </button>
                    <button
                      className="btn btnSmall btnDanger"
                      onClick={() => onDelete(p)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
