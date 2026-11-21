import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { CatalogPage } from "./CatalogPage";
import type { Product } from "../../../types/types";

const { mockProducts } = vi.hoisted(() => {
  const base = {
    description: "Test description",
    imageUrl: "https://example.com/a.jpg",
    inStock: true,
  };
  return {
    mockProducts: [
      {
        id: "1",
        name: "Ethiopia Yirgacheffe",
        price: 1550,
        category: "coffee_beans",
        roastLevel: "light",
        ...base,
      },
      {
        id: "2",
        name: "Sumatra Mandheling",
        price: 1350,
        category: "coffee_beans",
        roastLevel: "dark",
        ...base,
      },
      {
        id: "3",
        name: "Colombia Huila",
        price: 1400,
        category: "coffee_beans",
        roastLevel: "medium",
        ...base,
      },
      {
        id: "4",
        name: "Ceramic Dripper",
        price: 2500,
        category: "accessories",
        roastLevel: null,
        ...base,
      },
    ] as Product[],
  };
});

vi.mock("../../../hooks/useProducts", () => ({
  useProducts: () => ({
    data: mockProducts,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

const renderCatalog = () =>
  render(
    <MemoryRouter>
      <CatalogPage />
    </MemoryRouter>,
  );

const visibleNames = () =>
  screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);

describe("CatalogPage", () => {
  it("shows all products", () => {
    renderCatalog();
    expect(visibleNames()).toHaveLength(4);
    expect(screen.getByText("4 products")).toBeInTheDocument();
  });

  it("filters by search query, ignoring case and whitespace", async () => {
    const user = userEvent.setup();
    renderCatalog();

    await user.type(screen.getByLabelText("Search products"), "  ETHIOPIA ");
    expect(visibleNames()).toEqual(["Ethiopia Yirgacheffe"]);
  });

  it("filters by roast level", async () => {
    const user = userEvent.setup();
    renderCatalog();

    await user.click(screen.getByRole("button", { name: "Dark" }));
    expect(visibleNames()).toEqual(["Sumatra Mandheling"]);
  });

  it("filters by category and hides the roast filter for non-coffee categories", async () => {
    const user = userEvent.setup();
    renderCatalog();
    expect(screen.getByText("Roast:")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Accessories" }));

    expect(visibleNames()).toEqual(["Ceramic Dripper"]);
    expect(screen.queryByText("Roast:")).not.toBeInTheDocument();
  });

  it("sorts by price", async () => {
    const user = userEvent.setup();
    renderCatalog();
    const select = screen.getByLabelText("Sort by:");

    await user.selectOptions(select, "price-asc");
    expect(visibleNames()[0]).toBe("Sumatra Mandheling");

    await user.selectOptions(select, "price-desc");
    expect(visibleNames()[0]).toBe("Ceramic Dripper");
  });

  it("shows an empty state and resets the filters", async () => {
    const user = userEvent.setup();
    renderCatalog();

    await user.type(screen.getByLabelText("Search products"), "zzzz");
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset Filters" }));
    expect(visibleNames()).toHaveLength(4);
  });
});
