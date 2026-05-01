"use client";

import React, { use, useMemo, useState, useEffect } from "react";
import { notFound, useSearchParams, useRouter } from "next/navigation";
import { ProductGrid } from "../../components/ProductGrid";
import { CATEGORIES } from "../../data/mockProduct";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts, Product } from "../../context/ProductContext";
import { ProductModal } from "../../components/ProductModal";

interface PageProps {
  params: Promise<{ categoryId: string }>;
}

export default function CategoryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const categoryId = resolvedParams.categoryId;

  const searchParams = useSearchParams();
  const router = useRouter();
  const { products, loading } = useProducts();

  // State for Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 1. Validate category lookup
  const category = useMemo(() => {
    return CATEGORIES.find(
      (c) => c.id.toLowerCase() === categoryId.toLowerCase(),
    );
  }, [categoryId]);

  // 2. Filter products for grid
  const categoryProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(
      (p) => p.category?.toLowerCase() === categoryId.toLowerCase(),
    );
  }, [products, categoryId]);

  // 3. DEEP LINKING LOGIC: URL se productId check karein
  useEffect(() => {
    const productIdFromUrl = searchParams.get("productId");

    if (productIdFromUrl && products.length > 0) {
      const foundProduct = products.find((p) => p.id === productIdFromUrl);
      const selecProduct = () => {
        if (foundProduct) {
          setSelectedProduct(foundProduct);
        }
      };
      selecProduct();
    }
  }, [searchParams, products]);

  // Modal band karne ka function
  const handleCloseModal = () => {
    setSelectedProduct(null);
    // URL se productId hata dein taake clean URL ho jaye
    router.push(`/category/${categoryId}`, { scroll: false });
  };

  if (!category) {
    notFound();
  }

  return (
    <div className="relative min-h-screen">
      {/* Product Modal Overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={handleCloseModal} />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={categoryId}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="p-4 md:p-8"
        >
          {/* Category Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-[0.2em]">
                Collection
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3 capitalize">
              {category.name}
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl">
              Explore our curated collection of{" "}
              <span className="text-blue-600 font-bold">
                {categoryProducts.length}
              </span>{" "}
              viral finds in{" "}
              <span className="text-slate-900 font-medium lowercase">
                {category.name}
              </span>
              .
            </p>
          </div>

          {/* Product Display Logic */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-400 font-medium animate-pulse">
                Syncing with inventory...
              </p>
            </div>
          ) : categoryProducts.length > 0 ? (
            <ProductGrid products={categoryProducts} />
          ) : (
            <div className="bg-slate-50 rounded-4xl p-12 text-center border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">
                No products found in this category yet.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
