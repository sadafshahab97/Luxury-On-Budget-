"use client";
import React, { useState, useEffect } from "react"; // useEffect add kiya
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- Auto-Login Check ---
  // Agar user pehle se login hai toh usay login page par mat rukne dein
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push("/dashboard");
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        console.log("Login Successful! Syncing Profile...");

        // Pehle profile database mein confirm/create karein
        // Hum upsert use kar rahe hain taake agar row nahi hai toh ban jaye
        const { error: upsertError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          email: data.user.email,
          is_admin: true,
          updated_at: new Date().toISOString(),
        });

        if (upsertError) {
          console.error("Profile Sync Error:", upsertError);
          // Agar database sync fail bhi ho jaye, tab bhi dashboard bhej dein
          // kyunke humne middleware hta dia hai
        }

        console.log("Redirecting to Dashboard...");
        router.push("/dashboard");
        router.refresh(); // Next.js cache clear karne ke liye
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-blue-50 p-4 rounded-2xl mb-4">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold">Admin Login</h2>
        <p className="text-gray-500 text-sm">
          Sign in to access your dashboard
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="admin@example.com"
            className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-all flex justify-center items-center mt-4"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5 mr-2" />
              Verifying...
            </>
          ) : (
            "Login to Dashboard"
          )}
        </button>
      </form>
    </div>
  );
};
