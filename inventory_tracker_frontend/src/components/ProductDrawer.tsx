import React, { useEffect, useMemo, useState } from "react";
import type { Product, ProductCreate, ProductUpdate } from "../lib/types";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  product: Product | null;
  onClose: () => void;
  onSubmitCreate: (payload: ProductCreate) => Promise<void>;
  onSubmitUpdate: (id: string, payload: ProductUpdate) => Promise<void>;
};

type FormState = {
  name: string;
  sku: string;
  price: string;
  quantity: string;
};

function toForm(product: Product | null): FormState {
  return {
    name: product?.name || "",
    sku: product?.sku || "",
    price:
      product?.price === null || product?.price === undefined
        ? ""
        : String(product.price),
    quantity: product ? String(product.quantity) : "0"
  };
}

function parseNullableNumber(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  if (Number.isNaN(num)) return NaN;
  return num;
}

export function ProductDrawer(props: Props) {
  const { open, mode, product, onClose, onSubmitCreate, onSubmitUpdate } = props;

  const title = mode === "create" ? "Add product" : "Edit product";
  const [form, setForm] = useState<FormState>(() => toForm(product));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(toForm(product));
      setSubmitting(false);
      setFormError(null);
    }
  }, [open, product]);

  const canClose = !submitting;

  const validation = useMemo(() => {
    const name = form.name.trim();
    if (!name) return { ok: false, message: "Name is required." };

    const quantityNum = Number(form.quantity);
    if (!Number.isInteger(quantityNum) || quantityNum < 0) {
      return { ok: false, message: "Quantity must be an integer ≥ 0." };
    }

    const priceParsed = parseNullableNumber(form.price);
    if (priceParsed !== null && Number.isNaN(priceParsed)) {
      return { ok: false, message: "Price must be a number." };
    }
    if (priceParsed !== null && priceParsed < 0) {
      return { ok: false, message: "Price must be ≥ 0." };
    }

    return { ok: true as const };
  }, [form]);

  const onSubmit = async () => {
    setFormError(null);
    if (!validation.ok) {
      setFormError(validation.message);
      return;
    }

    const payloadBase = {
      name: form.name.trim(),
      sku: form.sku.trim() ? form.sku.trim() : null,
      price: parseNullableNumber(form.price),
      quantity: Number(form.quantity)
    };

    setSubmitting(true);
    try {
      if (mode === "create") {
        await onSubmitCreate(payloadBase as ProductCreate);
      } else {
        if (!product) throw new Error("No product selected");
        const updatePayload: ProductUpdate = {
          name: payloadBase.name,
          sku: payloadBase.sku,
          price: payloadBase.price,
          quantity: payloadBase.quantity
        };
        await onSubmitUpdate(product.id, updatePayload);
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Save failed");
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="drawerOverlay" role="presentation">
      <div className="drawerBackdrop" onClick={() => (canClose ? onClose() : undefined)} />
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="drawerHeader">
          <div>
            <div className="drawerTitle">{title}</div>
            <div className="drawerSubtitle">
              {mode === "create"
                ? "Create a new product in inventory."
                : "Update product details."}
            </div>
          </div>
          <button
            className="btn btnGhost"
            onClick={onClose}
            disabled={!canClose}
            aria-label="Close"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="drawerBody">
          {formError ? (
            <div className="inlineError" role="alert">
              {formError}
            </div>
          ) : null}

          <label className="field">
            <span className="fieldLabel">Name</span>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="e.g. Wireless Mouse"
            />
          </label>

          <label className="field">
            <span className="fieldLabel">SKU</span>
            <input
              className="input"
              value={form.sku}
              onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))}
              placeholder="Optional"
            />
          </label>

          <div className="grid2">
            <label className="field">
              <span className="fieldLabel">Price</span>
              <input
                className="input"
                inputMode="decimal"
                value={form.price}
                onChange={(e) =>
                  setForm((s) => ({ ...s, price: e.target.value }))
                }
                placeholder="Optional"
              />
            </label>

            <label className="field">
              <span className="fieldLabel">Quantity</span>
              <input
                className="input"
                inputMode="numeric"
                value={form.quantity}
                onChange={(e) =>
                  setForm((s) => ({ ...s, quantity: e.target.value }))
                }
                placeholder="0"
              />
            </label>
          </div>
        </div>

        <div className="drawerFooter">
          <button className="btn btnGhost" onClick={onClose} disabled={!canClose}>
            Cancel
          </button>
          <button
            className="btn btnPrimary"
            onClick={() => void onSubmit()}
            disabled={submitting}
            title={!validation.ok ? validation.message : undefined}
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </aside>
    </div>
  );
}
