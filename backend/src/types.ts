export type CustomerInfo = {
  fullName: string;
  email: string;
  address: string;
};

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  customer: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "completed";
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "coffee-beans" | "accessories" | "equipment";
  roastLevel?: "light" | "medium" | "dark";
  imageUrl: string;
  inStock: boolean;
};

export type CartItem = Product & {
  quantity: number;
};
