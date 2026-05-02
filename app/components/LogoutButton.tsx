"use client";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-slate-600 hover:text-red-600 px-4 py-2 bg-white border rounded-xl transition-all"
    >
      <LogOut className="w-4 h-4" />
      <span>Logout</span>
    </button>
  );
};
