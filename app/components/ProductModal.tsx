"use client";

import { Product } from "../context/ProductContext";
import { X, ExternalLink, ShoppingBag, BadgeCheck } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export const ProductModal = ({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6">
        {/* Backdrop - Smooth Blur Effect */}
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
          className="bg-white rounded-[2.5rem] max-w-4xl w-full overflow-hidden relative shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] z-[151] grid md:grid-cols-2"
        >
          {/* Close Button - Floating Style */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 p-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-full transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Image Section with Gradient Overlay */}
          <div className="relative h-[300px] md:h-full bg-slate-50 flex items-center justify-center group overflow-hidden">
            <Image
              src={product.image_url}
              alt={product.product_name}
              width={600}
              height={600}
              className="object-contain h-full w-full p-8 group-hover:scale-105 transition-transform duration-500"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
          </div>

          {/* Right: Content Section */}
          <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                {product.category}
              </span>
              <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
                <BadgeCheck className="w-3 h-3" /> In Stock
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-2">
              {product.product_name}
            </h2>

            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Experience premium quality and design with our latest{" "}
              {product.category} collection. Built for performance and everyday
              style.
            </p>

            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-4xl font-black text-slate-900 tracking-tight">
                {product.current_price}
              </span>
              {/* Optional: Add a placeholder old price for UI flair */}
              <span className="text-slate-400 line-through text-lg">
                $99.00
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={product.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-[0.98]"
              >
                <ShoppingBag className="w-5 h-5 group-hover:animate-bounce" />
                Buy Now
                <ExternalLink className="w-4 h-4 opacity-70" />
              </a>

              <p className="text-center text-slate-400 text-xs mt-2">
                Secure checkout provided by official store
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
