import { beforeEach, describe, expect, it } from "vitest";
import { useCartStore } from "./useCartStore";
import type { Product } from "../types/types";

const make = (id: string, price: number): Product => ({
  id,
  name: `Product ${id}`,
  description: "Test description",
  price,
  category: "coffee_beans",
  roastLevel: "medium",
  imageUrl: "https://example.com/a.jpg",
  inStock: true,
});

const a = make("a", 1000);
const b = make("b", 250);

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ items: [], isOpen: false });
});

describe("cart store", () => {
  it("adds a new product with quantity 1", () => {
    useCartStore.getState().addToCart(a);
    expect(useCartStore.getState().items).toEqual([
      { product: a, quantity: 1 },
    ]);
  });

  it("increments quantity when the same product is added again", () => {
    const { addToCart } = useCartStore.getState();
    addToCart(a);
    addToCart(a);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it("calculates totals", () => {
    const { addToCart, updateQuantity } = useCartStore.getState();
    addToCart(a);
    addToCart(b);
    updateQuantity("b", 4);

    expect(useCartStore.getState().getTotalPrice()).toBe(1000 + 250 * 4);
    expect(useCartStore.getState().getTotalItems()).toBe(5);
  });

  it("removes an item when quantity drops to zero", () => {
    const { addToCart, updateQuantity } = useCartStore.getState();
    addToCart(a);
    updateQuantity("a", 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("removes and clears", () => {
    const { addToCart, removeFromCart, clearCart } = useCartStore.getState();
    addToCart(a);
    addToCart(b);
    removeFromCart("a");
    expect(useCartStore.getState().items.map((i) => i.product.id)).toEqual([
      "b",
    ]);

    clearCart();
    expect(useCartStore.getState().items).toEqual([]);
  });
});
