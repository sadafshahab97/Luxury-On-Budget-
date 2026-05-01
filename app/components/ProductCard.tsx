"use client";

import React from "react";
import { Product } from "../context/ProductContext";
import { ExternalLink, Star, Share2 } from "lucide-react";
import { useToast } from "./ToastContext";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  index: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const { toast } = useToast();

  const displayRating =
    product.rating_score && product.rating_score !== "N/A"
      ? product.rating_score.match(/\d+(\.\d+)?/)?.[0] || "5.0"
      : "5.0";

  const handleShare = async () => {
    const categorySlug = product.category
      ? product.category.toLowerCase()
      : "products";
    const productId = product.id;
    const websiteLink = `${window.location.origin}/category/${categorySlug}?productId=${productId}`;

    // --- Rich Text Copy Logic ---
    const shareMessage = `🔥 *Check out this viral find on PinTrending!*

📦 *Product:* ${product.product_name}
💰 *Price:* ${product.current_price} ${product.original_price !== "N/A" ? `(Was: ${product.original_price})` : ""}
⭐ *Rating:* ${displayRating}/5

🔗 *Buy Here:* ${websiteLink}

#PinTrending #ViralProducts #Shopping`;

    try {
      await navigator.clipboard.writeText(shareMessage);
      toast("Product details & link copied!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast("Failed to copy details");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <Image
          src={product.image_url || "/placeholder.png"}
          alt={product.product_name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          width={400}
          height={400}
          unoptimized
        />

        {product.savings && product.savings !== "N/A" && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
            Save {product.savings}
          </div>
        )}

        {product.offer_tag && product.offer_tag !== "N/A" && (
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold px-3 py-1 rounded-lg border border-white/20 shadow-sm">
            {product.offer_tag}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col grow p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
            <span className="text-xs font-bold text-orange-700">
              {displayRating}
            </span>
          </div>
          {product.total_sold && product.total_sold !== "N/A" && (
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight">
              {product.total_sold} sold
            </span>
          )}
        </div>

        <h3 className="font-bold text-slate-800 text-md line-clamp-2 mb-3 leading-snug group-hover:text-blue-600 transition-colors">
          {product.product_name}
        </h3>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-slate-900 leading-none">
              {product.current_price}
            </span>
            {product.original_price && product.original_price !== "N/A" && (
              <span className="text-xs text-slate-400 line-through mt-1">
                {product.original_price}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
              title="Share Product"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <Link
              href={product.product_url || "#"}
              target="_blank"
              className="p-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
              <ExternalLink className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
