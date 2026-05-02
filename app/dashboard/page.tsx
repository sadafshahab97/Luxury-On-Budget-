"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product, useProducts } from "../context/ProductContext";
import { useToast } from "../components/ToastContext";
import { CATEGORIES } from "../data/mockProduct";
import {
  Database,
  Plus,
  Trash2,
  Edit2,
  X,

  LayoutGrid,
  Package,
  List,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Share2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { LogoutButton } from "../components/LogoutButton";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
interface ProductType {
  id: string;
  product_name: string;
  current_price: string;
  original_price: string;
  image_url: string;
  total_sold: string;
  product_url: string;
  savings: string;
  category: string;
  rating_score?: string;
  offer_tag?: string;
  created_at?: string;
}
export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
  const router = useRouter();
  const {
    products,
    loading: contextLoading,
    addProduct,
    deleteProduct,
    editProduct,
  } = useProducts();
  const { toast } = useToast();

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<ProductType>({
    id: "",
    product_name: "",
    current_price: "",
    original_price: "",
    total_sold: "",
    savings: "",
    image_url: "",
    product_url: "",
    category: "",
  });
  const [activeTab, setActiveTab] = useState<"overview" | "products">(
    "overview",
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Is useEffect ko replace karein
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Check User Session
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!user || userError) {
          console.log("No user found, redirecting...");
          router.push("/login");
          return;
        }

        // 2. Database se admin status check karein
        // maybeSingle isliye taake 0 rows par error na aaye
        const { data: profile} = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle();

        console.log("Dashboard auth check:", { userId: user.id, profile });

        if (profile?.is_admin) {
          // Case A: Admin hai
          setIsAuthenticated(true);
        } else {
          // Case B: Profile nahi hai ya admin status false hai
          console.log("Admin status missing. Auto-updating profile...");

          const { error: upsertError } = await supabase
            .from("profiles")
            .upsert({
              id: user.id,
              email: user.email,
              is_admin: true,
              updated_at: new Date().toISOString(),
            });

          if (upsertError) {
            console.error("Upsert failed:", upsertError);
            router.push("/login"); // Agar update na ho sake toh safe side login bhej dein
            return;
          }

          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Auth check unexpected error:", err);
        router.push("/login");
      } finally {
        setIsLoaded(true);
      }
    };

    checkAuth();
  }, [router]);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);

    setEditFormData({
      ...product,
      product_name: product.product_name || "",
      current_price: product.current_price || "",
      original_price: product.original_price || "",
      savings: product.savings || "N/A",
      rating_score: product.rating_score || "",
      total_sold: product.total_sold || "N/A",
      offer_tag: product.offer_tag || "N/A",
      image_url: product.image_url || "",
      product_url: product.product_url || "",
      category: product.category || "unassigned",
    });
  };

  const handleSaveEdit = async () => {
    if (editingProductId) {
      setIsProcessing(true);
      console.log("Saving Data to DB:", editFormData); // Yeh check karne ke liye ke data flat hai ya nahi
      try {
        await editProduct(editingProductId, editFormData);
        // Agar yahan tak pahunche hain, toh matlab DB update ho gaya
        toast("Product updated successfully!");
        setEditingProductId(null);
      } catch (error) {
        console.error("Save Error:", error);
        toast("Failed to update product");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
      toast("Product deleted from database!");
    }
  };

  const handleShare = async ({ product }: { product: Product }) => {
    try {
      // --- PART 1: TEXT COPY LOGIC ---
      const displayRating =
        product.rating_score && product.rating_score !== "N/A"
          ? product.rating_score.match(/\d+(\.\d+)?/)?.[0] || "5.0"
          : "5.0";

      const categorySlug = product.category
        ? product.category.toLowerCase()
        : "products";
      const websiteLink = `${window.location.origin}/category/${categorySlug}?productId=${product.id}`;

      const shareMessage = `🔥 *Check out this viral find on PinTrending!*

📦 *Product:* ${product.product_name}
💰 *Price:* ${product.current_price} ${product.original_price !== "N/A" ? `(Was: ${product.original_price})` : ""}
⭐ *Rating:* ${displayRating}/5

🔗 *Buy Here:* ${websiteLink}
`;

      // Clipboard par copy karein
      await navigator.clipboard.writeText(shareMessage);

      // --- PART 2: IMAGE AVIF TO JPEG DOWNLOAD ---
      if (!product.image_url) {
        toast("Text copied, but no image url found.");
        return;
      }

      toast("Downloading image...");

      /**
       * FIX: window.Image() use kiya hai taake Next.js ke <Image /> component
       * ke sath conflict na ho aur TypeScript error khatam ho jaye.
       */
      const img = new window.Image();

      // External images (Amazon/Temu) ke liye CORS handling
      img.crossOrigin = "Anonymous";

      img.onload = () => {
        // Canvas setup
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          toast("Failed to process image.");
          return;
        }

        // Original size settings
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Draw the AVIF image onto the canvas
        ctx.drawImage(img, 0, 0);

        // Convert to JPEG (Quality: 0.9)
        const jpegURL = canvas.toDataURL("image/jpeg", 0.9);

        // Create download link
        const link = document.createElement("a");
        link.href = jpegURL;

        // Filename ko clean karein (Special characters hata kar)
        const fileName = product.product_name
          .substring(0, 20)
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();

        link.download = `${fileName}_pintrending.jpg`;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast("Text copied & JPEG downloaded! ✅");
      };

      img.onerror = (err) => {
        console.error("Image load error:", err);
        toast("Text copied, but image conversion failed (CORS issue).");
      };

      // Load the image
      img.src = product.image_url;
    } catch (err) {
      console.error("Share handler failed:", err);
      toast("Something went wrong!");
    }
  };
  // Is interface ko component ke bahar ya top par rakhein
  interface ImportProduct {
    [key: string]: string | number | boolean | undefined | null;
  }

  const handleImport = async (): Promise<void> => {
    if (!jsonInput.trim()) {
      toast("Please paste JSON data first");
      return;
    }

    setIsProcessing(true);

    try {
      // JSON.parse ka result hum unknown cast karke array check karenge
      const parsedData: unknown = JSON.parse(jsonInput);

      // Typescript ko batana ke ye ya to ek object hai ya array
      const items = Array.isArray(parsedData)
        ? (parsedData as ImportProduct[])
        : [parsedData as ImportProduct];

      // Sequential updates with proper typing
      for (const item of items) {
        await addProduct({
          ...item,
          category: categoryId,
          rating_score: item.rating_score ?? "0",
        } as Omit<Product, "id" | "created_at">); // Ensure compatibility with your context type
      }

      toast(`Imported ${items.length} products successfully!`);
      setJsonInput("");
      setActiveTab("products");
    } catch (error) {
      // Catch block mein 'any' ki jagah Instance check use karein
      if (error instanceof Error) {
        alert("Invalid JSON format: " + error.message);
      } else {
        alert("An unexpected error occurred during import.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Authenticating Admin...
          </p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-8 min-h-screen"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-blue-600" /> Admin Panel
          </h1>
          <p className="text-slate-500">Inventory & Database Management</p>
          <LogoutButton />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-2 sticky top-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === "overview" ? "bg-blue-600 text-white shadow-blue-200 shadow-lg" : "bg-white text-slate-600 border"}`}
            >
              <Plus className="w-5 h-5" /> Import Data
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === "products" ? "bg-blue-600 text-white shadow-blue-200 shadow-lg" : "bg-white text-slate-600 border"}`}
            >
              <List className="w-5 h-5" /> Inventory ({products.length})
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 border flex items-center gap-5 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Package />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                      Total Items
                    </p>
                    <h3 className="text-2xl font-bold">{products.length}</h3>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border flex items-center gap-5 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Database />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                      Cloud Sync
                    </p>
                    <h3 className="text-2xl font-bold text-emerald-600">
                      Active
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border p-7 shadow-sm">
                <h2 className="text-xl font-bold mb-6">
                  Bulk Import (Temu JSON Format)
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">
                      Target Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">
                      Paste JSON Array
                    </label>
                    <textarea
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={10}
                      placeholder='[{ "product_name": "Top pick", "price": { "current_price": "$12.16", ... }, ... }]'
                    />
                  </div>

                  <button
                    onClick={handleImport}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 transition-all disabled:bg-blue-300"
                  >
                    {isProcessing
                      ? "Adding to Database..."
                      : "Push Products to Cloud"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b bg-slate-50/50">
                <h2 className="font-bold text-lg text-slate-800">
                  Product Management
                </h2>
              </div>

              <div className="divide-y overflow-x-auto">
                {contextLoading ? (
                  <div className="p-20 text-center text-slate-400">
                    Syncing with database...
                  </div>
                ) : currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors min-w-150"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden border bg-white shrink-0">
                        <Image
                          src={product.image_url || "/placeholder.png"}
                          className="w-full h-full object-cover"
                          alt=""
                          width={500}
                          height={500}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate text-sm">
                          {product.product_name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span className="text-emerald-600 font-bold">
                            {product.current_price}
                          </span>
                          <span className="text-slate-400 line-through">
                            {product.original_price}
                          </span>
                          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                            {product.offer_tag !== "N/A"
                              ? product.offer_tag
                              : "Standard"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShare({ product })}
                          className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
                          title="Share Product"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                        <Link
                          href={product.product_url}
                          target="_blank"
                          className="p-2.5 text-slate-400 hover:text-slate-600 border rounded-xl bg-white transition-all shadow-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleEditClick(product)}
                          className="p-2.5 text-blue-500 hover:bg-blue-50 border border-blue-100 rounded-xl bg-white transition-all shadow-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2.5 text-red-500 hover:bg-red-50 border border-red-100 rounded-xl bg-white transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center text-slate-400">
                    No products found.
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="p-4 border-t flex justify-between items-center bg-slate-50/30">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="p-2 disabled:opacity-30 border rounded-lg bg-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-slate-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="p-2 disabled:opacity-30 border rounded-lg bg-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal - Full Field Control */}
      <AnimatePresence>
        {editingProductId && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-3xl shadow-2xl my-8 relative"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800">
                  Advanced Product Editor
                </h3>
                <button
                  onClick={() => setEditingProductId(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[65vh] overflow-y-auto pr-2 px-1 custom-scrollbar">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                    External Product Link
                  </label>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs text-blue-600"
                    value={editFormData.product_url || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        product_url: e.target.value,
                      })
                    }
                  />
                </div>
                {/* Product Basic Name */}
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">
                    Product Identity
                  </label>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    value={editFormData.product_name || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        product_name: e.target.value,
                      })
                    }
                    placeholder="Enter full product name"
                  />
                </div>

                {/* Price Management Section */}
                <div className="p-5 bg-blue-50/30 rounded-4xl border border-blue-50">
                  <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 block">
                    Price Settings
                  </label>
                  <div className="space-y-4">
                    <input
                      placeholder="Current Price (e.g. $12.16)"
                      className="w-full bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                      value={editFormData.current_price || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          current_price: e.target.value,
                        })
                      }
                    />
                    <input
                      placeholder="Original Price (e.g. $27.86)"
                      className="w-full bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                      value={editFormData.original_price || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          original_price: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Rating & Marketing Tag */}
                <div className="p-5 bg-emerald-50/30 rounded-4xl border border-emerald-50">
                  <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3 block">
                    Marketing Info
                  </label>
                  <div className="space-y-4">
                    <input
                      placeholder="Rating (e.g. 4.8 out of five)"
                      className="w-full bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none"
                      value={editFormData.rating_score || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          rating_score: e.target.value,
                        })
                      }
                    />
                    <input
                      placeholder="Offer Tag (e.g. 56% OFF)"
                      className="w-full bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none"
                      value={editFormData.offer_tag || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          offer_tag: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">
                    Category
                  </label>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                    value={editFormData.category || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        category: e.target.value,
                      })
                    }
                    placeholder="e.g. Home Decor"
                  />
                </div>
                {/* URLs Management */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                      Image Source URL
                    </label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xs text-blue-600"
                      value={editFormData.image_url || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          image_url: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleSaveEdit}
                disabled={isProcessing}
                className="w-full bg-slate-900 text-white py-5 rounded-3xl font-bold text-lg shadow-2xl hover:bg-black transition-all mt-8 active:scale-[0.98] disabled:opacity-50"
              >
                {isProcessing ? "Synchronizing Data..." : "Update Everything"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
