import { useEffect, useState } from "react";
import { http } from "../../lib/http";
import { formatPrice } from "../../lib/api";
import type { Order, OrderStatus } from "../../types/types";

const STATUSES: OrderStatus[] = ["pending", "processing", "completed"];

export const OrderPage = ({ admin = false }: { admin?: boolean }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    http<Order[]>(admin ? "/api/orders" : "/api/orders/my")
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [admin]);
  const changeStatus = async (id: string, status: OrderStatus) => {
    try {
      const updated = await http<Order>(`/api/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    }
  };
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">
        {admin ? "All orders" : "My orders"}
      </h1>
      {loading && <p className="text-stone-500">Loading...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {!loading && orders.length === 0 && (
        <p className="text-stone-500">No orders yet.</p>
      )}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-stone-200 rounded-xl p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <p className="font-semibold text-stone-900">
                  #{order.id.slice(-8)}
                </p>
                <p className="text-xs text-stone-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              {admin ? (
                <select
                  value={order.status}
                  onChange={(e) =>
                    changeStatus(order.id, e.target.value as OrderStatus)
                  }
                  className="border border-stone-300 rounded-lg px-2 py-1 text-sm cursor-pointer"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs font-semibold uppercase tracking-wider bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full">
                  {order.status}
                </span>
              )}
            </div>
            {admin && (
              <p className="text-sm text-stone-600 mb-3">
                {order.customerName} · {order.customerEmail} ·{" "}
                {order.customerAddress}
              </p>
            )}
            <ul className="text-sm text-stone-700 space-y-1 mb-3">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between">
                  <span>
                    {i.productName} × {i.quantity}
                  </span>
                  <span>{formatPrice(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="text-right font-bold text-amber-700">
              {formatPrice(order.totalAmount)}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
};
