"use client";
import { useEffect, useState } from "react";

export default function FisListesi() {
  const [username, setUsername] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("username");
      setUsername(name || "Ziyaretçi");
    }
  }, []);

  useEffect(() => {
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/transactions`)
      .then(res => res.json())
      .then(data => setTransactions(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6">
        Fişlerim
      </h1>
      {loading ? (
        <div>Yükleniyor...</div>
      ) : transactions.length === 0 ? (
        <div>Henüz fiş eklemediniz.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border rounded-xl shadow-lg bg-white dark:bg-gray-800">
            <thead>
              <tr className="bg-blue-100 dark:bg-blue-900">
                <th className="py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold text-left rounded-tl-xl">Mağaza</th>
                <th className="py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold text-left">İşlem Tipi</th>
                <th className="py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold text-left">Toplam</th>
                <th className="py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold text-left">Ürün Sayısı</th>
                <th className="py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold text-left rounded-tr-xl">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((fis, idx) => (
                <tr
                  key={fis._id}
                  className={
                    `transition-colors ${idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} hover:bg-blue-50 dark:hover:bg-blue-950`
                  }
                >
                  <td className="py-2 px-4 font-medium">{fis.storeName || '-'}</td>
                  <td className="py-2 px-4 capitalize">{fis.type || '-'}</td>
                  <td className="py-2 px-4 text-blue-700 dark:text-blue-300 font-semibold">{fis.total?.toFixed(2) || '0.00'}₺</td>
                  <td className="py-2 px-4 text-center">{fis.items?.length || 0}</td>
                  <td className="py-2 px-4 text-sm text-gray-600 dark:text-gray-300">{fis.createdAt ? new Date(fis.createdAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 