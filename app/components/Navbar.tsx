"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "../data/mockProduct";
import { ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { SearchBar } from "../components/SearchBar";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    const closeMenu = () => {
      setIsMobileMenuOpen(false);
      setIsCategoryDropdownOpen(false);
    };
    closeMenu();
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 rounded-lg text-white p-1.5 transition-transform group-hover:scale-105">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              PinTrending
            </span>
          </Link>

          {/* Desktop Navigation & Search */}
          <div className="hidden md:flex items-center flex-1 ml-8">
            <div className="flex-1 max-w-lg mr-8">
              <SearchBar />
            </div>
            <nav className="flex space-x-1 items-center">
              <Link
                href="/"
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  pathname === "/"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                )}
              >
                All Products
              </Link>

              {/* Categories Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() =>
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                  }
                  className={cn(
                    "flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    isCategoryDropdownOpen || pathname.includes("/category/")
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                  )}
                >
                  Categories
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isCategoryDropdownOpen && "rotate-180",
                    )}
                  />
                </button>

                <AnimatePresence>
                  {isCategoryDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50"
                    >
                      {CATEGORIES.map((cat) => {
                        // FIX: Ensure path matches your folder structure /category/[categoryId]
                        const categoryPath = `/category/${cat.id}`;
                        const isActive = pathname === categoryPath;

                        return (
                          <Link
                            key={cat.id}
                            href={categoryPath}
                            className={cn(
                              "block px-4 py-2.5 text-sm transition-colors",
                              isActive
                                ? "bg-slate-50 text-blue-600 font-medium"
                                : "text-slate-700 hover:bg-slate-50 hover:text-blue-600",
                            )}
                          >
                            {cat.name}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white border-t border-slate-100"
          >
            <div className="px-4 py-4 space-y-2 flex flex-col">
              <div className="mb-4">
                <SearchBar />
              </div>
              <Link
                href="/"
                className={cn(
                  "block px-4 py-3 rounded-xl text-base font-medium transition-colors",
                  pathname === "/"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                All Products
              </Link>

              <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Categories
              </div>

              {CATEGORIES.map((cat) => {
                const categoryPath = `/category/${cat.id}`;
                const isActive = pathname === categoryPath;

                return (
                  <Link
                    key={cat.id}
                    href={categoryPath}
                    className={cn(
                      "block px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 pl-6",
                    )}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
