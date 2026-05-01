// components/ProductModal.tsx
import { Product } from "../context/ProductContext";
import { X, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const ProductModal = ({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white rounded-[3rem] max-w-2xl w-full overflow-hidden relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white"
        >
          <X className="w-6 h-6 text-slate-900" />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="relative ">
            <Image
              src={product.image_url}
              alt={product.product_name}
              width={800}
              height={800}
              className="object-cover h-full w-full"
           
            />
          </div>
          <div className="p-8 flex flex-col justify-center">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-2 block">
              {product.category}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {product.product_name}
            </h2>
            <div className="text-3xl font-black text-slate-900 mb-6">
              {product.current_price}
            </div>
            <Link
              href={product.product_url}
              target="_blank"
              className="bg-blue-600 text-white text-center py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
            >
              View on Store <ExternalLink className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
