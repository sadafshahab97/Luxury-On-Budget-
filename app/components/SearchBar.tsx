"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Search, Loader2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product, useProducts } from "../context/ProductContext";

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { products } = useProducts();


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

 
  useEffect(() => {
    const search = () => {
      if (query.trim().length === 0) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsSearching(true);
      setIsOpen(true);

      const timer = setTimeout(() => {
        const lowercaseQuery = query.toLowerCase();

     
        const filtered = products.filter(
          (p) =>
            p.product_name?.toLowerCase().includes(lowercaseQuery) ||
            p.offer_tag?.toLowerCase().includes(lowercaseQuery),
        );

        setResults(filtered);
        setIsSearching(false);
      }, 400);

      return () => clearTimeout(timer);
    };
    search();
  }, [query, products]);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md mx-auto md:mx-0">
      {/* Input Field */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-full leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 sm:text-sm"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length > 0) setIsOpen(true);
          }}
        />
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
          >
            {isSearching ? (
              <div className="p-4 flex items-center justify-center text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-80 overflow-y-auto overscroll-contain">
                {results.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
             
                      if (product.product_url) {
                        window.open(product.product_url, "_blank");
                      }
                    }}
                    className="flex items-center gap-3 p-3 text-left hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                  >
                    <div className="relative w-12 h-12 shrink-0">
                      <Image
                        src={product.image_url || "/placeholder.png"}
                        alt={product.product_name}
                        fill
                        sizes="48px"
                        className="object-cover rounded-lg bg-slate-100"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {product.product_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate capitalize">
                        {product.offer_tag !== "N/A"
                          ? product.offer_tag
                          : "Product"}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900">
                        {product.current_price}
                      </p>
                      <ExternalLink className="h-3 w-3 text-slate-400 inline-block ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-slate-500">
                No products found matching {`"${query}"`}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
