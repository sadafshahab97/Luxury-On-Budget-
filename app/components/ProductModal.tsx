"use client";

import { Product } from "../context/ProductContext";
import { X, ExternalLink, ShoppingBag, BadgeCheck } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export const ProductModal = ({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-4xl md:rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto md:overflow-hidden relative shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] z-151 grid md:grid-cols-2"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-5 md:right-5 z-30 p-2 bg-white/80 md:bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-full transition-all active:scale-90 shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Image Section */}
        <div className="relative h-70 sm:h-87.5 md:h-full bg-slate-50 flex items-center justify-center group overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.product_name}
            width={600}
            height={600}
            className="object-contain h-full w-full p-6 md:p-12 group-hover:scale-105 transition-transform duration-500"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent pointer-events-none" />
        </div>

        {/* Right: Content Section */}
        <div className="p-6 md:p-12 flex flex-col justify-center bg-white">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-red-100">
              {product.category}
            </span>
            <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
              <BadgeCheck className="w-3 h-3" /> In Stock
            </span>
          </div>

          {/* Truncated Product Name */}
          <h2
            className="text-lg md:text-3xl font-extrabold text-slate-900 leading-tight mb-2 line-clamp-2 md:line-clamp-3"
            title={product.product_name}
          >
            {product.product_name}
          </h2>

          <div className="flex items-baseline gap-3 mb-6 md:mb-8">
            <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              {product.current_price}
            </span>
            <span className="text-slate-400 line-through text-base md:text-lg">
              $99.00
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={product.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-red-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 transition-all active:scale-[0.98]"
            >
              <ShoppingBag className="w-5 h-5 group-hover:animate-bounce" />
              <span>Buy Now</span>
              <ExternalLink className="w-4 h-4 opacity-70" />
            </a>

            <p className="text-center text-slate-400 text-[10px] md:text-xs mt-2">
              Secure checkout provided by official store
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
