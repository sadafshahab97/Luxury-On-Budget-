"use client"
import { ProductGrid } from "./components/ProductGrid";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { useProducts } from "./context/ProductContext";

const HomePage = () => {
  const { products } = useProducts();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white mb-10 shadow-lg text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2000')] opacity-10 mix-blend-overlay bg-cover bg-center"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 bg-white/20 text-blue-50 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" /> Handpicked Finds
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            {`Trending Products You Didn't Know You Needed.`}
          </h1>
          <p className="text-blue-100 text-lg">
            Discover the most viral and high-rated gadgets, decor, and hacks on
            the internet.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          All Trending Finds
        </h2>
      </div>

      <ProductGrid products={products} />
    </motion.div>
  );
};

export default HomePage;
