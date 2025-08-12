"use client";

import React, { useState } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage(data.error);
      } else {
        setMessage("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    } catch (err) {
      setMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-4 dark:text-blue-200">Kayıt Ol</h1>
      <form className="flex flex-col gap-4 w-80 bg-white dark:bg-gray-800 p-6 rounded shadow" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          className="border rounded px-3 py-2 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          required
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="E-posta"
          className="border rounded px-3 py-2 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Şifre"
          className="border rounded px-3 py-2 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2 font-semibold dark:bg-green-700 dark:hover:bg-green-800"
          disabled={loading}
        >
          {loading ? "Kaydediliyor..." : "Kayıt Ol"}
        </button>
        <a href="/login" className="text-blue-600 text-center mt-2 hover:underline dark:text-blue-400">
          Zaten hesabınız var mı? Giriş yap
        </a>
        {message && (
          <div className="text-center text-sm mt-2 text-red-600 dark:text-red-400">{message}</div>
        )}
      </form>
    </main>
  );
} 