"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Product } from "../context/ProductContext"; // Updated to use Context Type
import { ProductCard } from "./ProductCard";
import { Loader2 } from "lucide-react";

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);

  const ITEMS_PER_PAGE = 8;

  // Jab main products list update ho (Category change ya Initial load)
  useEffect(() => {
    const updateProductList = () => {
      if (products.length > 0) {
        setDisplayedProducts(products.slice(0, ITEMS_PER_PAGE));
        setHasMore(products.length > ITEMS_PER_PAGE);
      } else {
        setDisplayedProducts([]);
        setHasMore(false);
      }
    };
    updateProductList();
  }, [products]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore || products.length === 0) return;

    setIsLoading(true);

    // Simulate network delay for smooth feel
    setTimeout(() => {
      setDisplayedProducts((prev) => {
        const nextBatchStart = prev.length;
        const nextBatchEnd = nextBatchStart + ITEMS_PER_PAGE;
        const nextBatch = products.slice(nextBatchStart, nextBatchEnd);

        if (nextBatchEnd >= products.length) {
          setHasMore(false);
        }

        return [...prev, ...nextBatch];
      });

      setIsLoading(false);
    }, 800);
  }, [isLoading, hasMore, products]);

  // Observer callback: Yeh detect karta hai jab user last item tak pohanch jaye
  const lastProductElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, loadMore],
  );

  // Empty State
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-500">
        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mb-6 text-4xl">
          📦
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          No products found
        </h3>
        <p className="text-slate-500 max-w-xs">
          Humein is category mein abhi koi products nahi mile. Dobara check
          karein!
        </p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        {displayedProducts.map((product, index) => {
          const isLastElement = displayedProducts.length === index + 1;

          return (
            <div
              key={product.id} // Supabase ID is unique, no need to append page strings
              ref={isLastElement ? lastProductElementRef : null}
              className="h-full"
            >
              <ProductCard product={product} index={index % ITEMS_PER_PAGE} />
            </div>
          );
        })}
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="flex flex-col justify-center items-center py-12">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-2" />
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
            Loading Awesome Products...
          </p>
        </div>
      )}

      {/* End of list message */}
      {!hasMore && displayedProducts.length > 0 && (
        <div className="flex items-center justify-center gap-4 py-16">
          <div className="h-px w-12 bg-slate-200"></div>
          <span className="text-slate-400 text-sm font-medium italic">
            {`You've seen everything!`}
          </span>
          <div className="h-px w-12 bg-slate-200"></div>
        </div>
      )}
    </div>
  );
};
