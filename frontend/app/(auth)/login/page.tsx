"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
              const res = await fetch(`http://localhost:6602/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      console.log("Gelen veri:", data);
      if (data.error) {
        alert(data.error);
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("email", data.user.email);
        alert("Giriş başarılı!");
        window.location.href = "/profil";
      }
    } catch (err) {
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-black/60 dark:bg-black/70 rounded-2xl shadow-2xl px-8 py-10 w-full max-w-md flex flex-col items-center backdrop-blur-md border border-white/10">
        <h2 className="text-3xl font-bold text-white mb-6 tracking-wide">Giriş Yap</h2>
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="px-4 py-3 rounded-lg bg-white/80 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="px-4 py-3 rounded-lg bg-white/80 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          />
          <button
            type="submit"
            className="mt-2 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg shadow-md hover:scale-105 hover:from-blue-600 hover:to-purple-700 transition"
          >
            Giriş Yap
          </button>
        </form>
        <p className="text-gray-300 mt-6">
          Hesabın yok mu?{" "}
          <a href="/register" className="text-blue-400 hover:underline font-semibold">
            Kaydol
          </a>
        </p>
      </div>
    </div>
  );
} 
