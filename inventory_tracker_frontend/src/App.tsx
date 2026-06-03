import React, { useEffect, useMemo, useState } from "react";
import { ApiClient } from "./lib/apiClient";
import type { Product, ProductCreate, ProductUpdate } from "./lib/types";
import { subscribeToLiveUpdates } from "./lib/liveUpdates";
import { Header } from "./components/Header";
import { ProductsTable } from "./components/ProductsTable";
import { ProductDrawer } from "./components/ProductDrawer";
import { Toast, type ToastState } from "./components/Toast";

type DrawerMode = "create" | "edit";
type DrawerState =
  | { open: false }
  | { open: true; mode: DrawerMode; product?: Product };

function getApiBaseUrl(): string {
  const url = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return url?.trim() || "http://localhost:8000";
}

function getLiveUpdatesBaseUrl(): string {
  const url = import.meta.env.VITE_LIVE_UPDATES_BASE_URL as string | undefined;
  return (url?.trim() || getApiBaseUrl()).trim();
}

export default function App() {
  const api = useMemo(() => new ApiClient({ baseUrl: getApiBaseUrl() }), []);

  const [loading, setLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [drawer, setDrawer] = useState<DrawerState>({ open: false });
  const [toast, setToast] = useState<ToastState | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.listProducts();
      setProducts(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live updates subscription:
  // We subscribe to a best-effort channel. If the backend isn't ready yet, we show a non-blocking toast.
  useEffect(() => {
    const liveBase = getLiveUpdatesBaseUrl();

    const sub = subscribeToLiveUpdates({
      baseUrl: liveBase,
      onEvent: (evt) => {
        // For correctness (and simplicity), reload on any change event.
        // This keeps UI in sync even if server-side logic changes.
        void reload();

        setToast({
          kind: "info",
          message:
            evt.type === "created"
              ? "Product added"
              : evt.type === "updated"
                ? "Product updated"
                : evt.type === "deleted"
                  ? "Product deleted"
                  : "Inventory changed"
        });
      },
      onStatus: (status) => {
        if (status === "error") {
          setToast({
            kind: "warning",
            message:
              "Live updates unavailable (will continue with manual refresh)."
          });
        }
      }
    });

    return () => sub.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAddClick = () => setDrawer({ open: true, mode: "create" });
  const onEditClick = (p: Product) =>
    setDrawer({ open: true, mode: "edit", product: p });
  const onDrawerClose = () => setDrawer({ open: false });

  const onSubmitCreate = async (payload: ProductCreate) => {
    try {
      await api.createProduct(payload);
      setToast({ kind: "success", message: "Product created" });
      setDrawer({ open: false });
      await reload();
    } catch (e) {
      setToast({
        kind: "error",
        message: e instanceof Error ? e.message : "Create failed"
      });
      throw e;
    }
  };

  const onSubmitUpdate = async (id: string, payload: ProductUpdate) => {
    try {
      await api.updateProduct(id, payload);
      setToast({ kind: "success", message: "Product updated" });
      setDrawer({ open: false });
      await reload();
    } catch (e) {
      setToast({
        kind: "error",
        message: e instanceof Error ? e.message : "Update failed"
      });
      throw e;
    }
  };

  const onDelete = async (p: Product) => {
    const ok = window.confirm(`Delete "${p.name}"? This cannot be undone.`);
    if (!ok) return;

    try {
      await api.deleteProduct(p.id);
      setToast({ kind: "success", message: "Product deleted" });
      await reload();
    } catch (e) {
      setToast({
        kind: "error",
        message: e instanceof Error ? e.message : "Delete failed"
      });
    }
  };

  return (
    <div className="app">
      <Header
        title="Inventory Tracker"
        subtitle="Manage products and keep inventory up to date"
        onAdd={onAddClick}
        onRefresh={() => void reload()}
        liveUpdatesHint="Live updates enabled (best effort)"
      />

      <main className="container">
        {error ? (
          <div className="card errorCard" role="alert">
            <div className="errorTitle">Could not load products</div>
            <div className="errorBody">{error}</div>
            <div className="row gap">
              <button className="btn btnPrimary" onClick={() => void reload()}>
                Retry
              </button>
            </div>
          </div>
        ) : (
          <ProductsTable
            loading={loading}
            products={products}
            onEdit={onEditClick}
            onDelete={onDelete}
          />
        )}
      </main>

      <ProductDrawer
        open={drawer.open}
        mode={drawer.open ? drawer.mode : "create"}
        product={drawer.open && drawer.mode === "edit" ? drawer.product : null}
        onClose={onDrawerClose}
        onSubmitCreate={onSubmitCreate}
        onSubmitUpdate={onSubmitUpdate}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
