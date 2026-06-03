export type InventoryEvent =
  | { type: "created"; product_id?: string }
  | { type: "updated"; product_id?: string }
  | { type: "deleted"; product_id?: string }
  | { type: "unknown"; raw?: unknown };

type Status = "connecting" | "connected" | "error" | "closed";

type LiveUpdatesConfig = {
  baseUrl: string;
  onEvent: (event: InventoryEvent) => void;
  onStatus?: (status: Status) => void;
};

function joinUrl(baseUrl: string, path: string): string {
  const b = baseUrl.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

/**
 * Subscribe to live inventory change events.
 *
 * This is implemented using Server-Sent Events (EventSource), which is a good fit for
 * unidirectional broadcast. If the backend isn't providing SSE yet, this will fail
 * gracefully and the UI will continue working with manual refresh / post-CRUD reloads.
 */
// PUBLIC_INTERFACE
export function subscribeToLiveUpdates(config: LiveUpdatesConfig): {
  close: () => void;
} {
  const { baseUrl, onEvent, onStatus } = config;

  const url = joinUrl(baseUrl, "/events");
  onStatus?.("connecting");

  let es: EventSource | null = null;
  try {
    es = new EventSource(url);
  } catch {
    onStatus?.("error");
    return { close: () => undefined };
  }

  es.onopen = () => onStatus?.("connected");
  es.onerror = () => {
    // Some environments will continuously retry; we mark error for UI hinting.
    onStatus?.("error");
  };

  es.onmessage = (msg) => {
    try {
      const parsed = JSON.parse(msg.data) as unknown;

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "type" in parsed &&
        typeof (parsed as { type: unknown }).type === "string"
      ) {
        const type = (parsed as { type: string }).type;
        const product_id =
          typeof (parsed as { product_id?: unknown }).product_id === "string"
            ? (parsed as { product_id: string }).product_id
            : undefined;

        if (type === "created" || type === "updated" || type === "deleted") {
          onEvent({ type, product_id });
          return;
        }
      }

      onEvent({ type: "unknown", raw: parsed });
    } catch {
      onEvent({ type: "unknown", raw: msg.data });
    }
  };

  return {
    close: () => {
      onStatus?.("closed");
      es?.close();
    }
  };
}
