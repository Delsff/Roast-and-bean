export type User = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
};

export type OrderStatus = "pending" | "processing" | "completed";

export type OrderItem = {
  id: string;
  productName: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "coffee_beans" | "accessories" | "equipment";
  roastLevel: "light" | "medium" | "dark" | null;
  imageUrl: string;
  inStock: boolean;
};
