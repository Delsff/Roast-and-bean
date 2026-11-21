import { useQuery } from "@tanstack/react-query";
import { http } from "../lib/http";
import type { Product } from "../types/types";

export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: () => http<Product[]>("/api/products"),
  });

export const useProduct = (id: string | undefined) =>
  useQuery({
    queryKey: ["products", id],
    queryFn: () => http<Product>(`/api/products/${id}`),
    enabled: !!id,
  });
