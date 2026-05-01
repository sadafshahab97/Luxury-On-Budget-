"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

export interface Product {
  id: string;
  product_name: string;
  current_price: string;
  original_price: string;
  savings: string;
  rating_score: string;
  total_sold: string;
  offer_tag: string;
  image_url: string;
  product_url: string;
  category: string;
  created_at?: string;
}
interface RawProductInput {
  product_name?: string;
  price?: {
    current_price?: string;
    original_price?: string;
    savings?: string;
  };
  current_price?: string;
  original_price?: string;
  savings?: string;
  rating?: {
    score?: string;
    total_sold?: string;
  };
  rating_score?: string;
  total_sold?: string;
  offer_details?: {
    tag?: string;
  };
  offer_tag?: string;
  image_url: string;
  product_url: string;
  category: string;
}
interface ProductContextType {
  products: Product[];
  loading: boolean;

  // addProduct ke liye hum Omit use karenge kyunke naye product ke pas 'id' nahi hoti
  addProduct: (
    productData: Omit<Product, "id" | "created_at">,
  ) => Promise<void>;

  deleteProduct: (id: string) => Promise<void>;

  // editProduct ke liye Partial use karenge kyunke ho sakta hai user sirf ek field update kare
  editProduct: (id: string, updatedData: Partial<Product>) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Products from Supabase
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetch = () => {
      fetchProducts();
    };
    fetch();
  }, []);

  // 2. Add Product Logic (Handling Temu JSON)
  const addProduct = async (jsonData: RawProductInput): Promise<void> => {
    try {
      // Omit id because DB handles it
      const newEntry: Omit<Product, "id" | "created_at"> = {
        product_name: jsonData.product_name || "New Product",
        current_price:
          jsonData.price?.current_price || jsonData.current_price || "N/A",
        original_price:
          jsonData.price?.original_price || jsonData.original_price || "N/A",
        savings: jsonData.price?.savings || jsonData.savings || "N/A",
        rating_score: jsonData.rating?.score || jsonData.rating_score || "N/A",
        total_sold: jsonData.rating?.total_sold || jsonData.total_sold || "N/A",
        offer_tag: jsonData.offer_details?.tag || jsonData.offer_tag || "N/A",
        image_url: jsonData.image_url || "",
        product_url: jsonData.product_url || "",
        category: jsonData.category || "unassigned",
      };

      const { data, error } = await supabase
        .from("products")
        .insert([newEntry])
        .select();

      if (error) throw error;
      if (data) setProducts((prev) => [data[0] as Product, ...prev]);
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  // 3. Delete Product
  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // 4. Edit Product (Ensuring Flat Data for Supabase)
  const editProduct = async (
    id: string,
    updatedData: Partial<Product>,
  ): Promise<void> => {
    try {
      // Step A: Mapping with explicit types
      const formattedData: Partial<Product> = {
        product_name: updatedData.product_name,
        current_price: updatedData.current_price,
        original_price: updatedData.original_price,
        savings: updatedData.savings,
        rating_score: updatedData.rating_score,
        total_sold: updatedData.total_sold,
        offer_tag: updatedData.offer_tag,
        image_url: updatedData.image_url,
        product_url: updatedData.product_url,
        category: updatedData.category,
      };

      // Step B: Supabase Update Call
      const { data, error } = await supabase
        .from("products")
        .update(formattedData)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Supabase Update Error:", error.message);
        alert(`DB Update Failed: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) return;

      // Step C: Update Local State
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...formattedData } : p)),
      );

      console.log("Database updated successfully!");
    } catch (error) {
      console.error("Critical Error in editProduct:", error);
    }
  };

  return (
    <ProductContext.Provider
      value={{ products, loading, addProduct, deleteProduct, editProduct }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within ProductProvider");
  }
  return context;
};
