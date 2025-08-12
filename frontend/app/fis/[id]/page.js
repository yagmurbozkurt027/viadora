"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function FisDetay() {
  const params = useParams();
  const { id } = params;
  const [fis, setFis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/transactions/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Fiş bulunamadı");
        return res.json();
      })
      .then(data => setFis(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center mt-20">Yükleniyor...</div>;
  if (error) return <div className="text-center mt-20 text-red-600">{error}</div>;
  if (!fis) return <div className="text-center mt-20 text-red-600">Fiş bulunamadı</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg mt-10">
      <h1 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-200 text-center">Fiş Detayı</h1>
      <div className="mb-4 flex flex-col gap-2">
        <div><span className="font-semibold">Mağaza:</span> {fis.storeName || '-'}</div>
        <div><span className="font-semibold">İşlem Tipi:</span> {fis.type || '-'}</div>
        <div><span className="font-semibold">Toplam:</span> <span className="text-blue-700 dark:text-blue-300 font-semibold">{fis.total?.toFixed(2) || '0.00'}₺</span></div>
        <div><span className="font-semibold">Tarih:</span> {fis.createdAt ? new Date(fis.createdAt).toLocaleString() : '-'}</div>
        <div><span className="font-semibold">Açıklama:</span> {fis.description || '-'}</div>
        <div><span className="font-semibold">İşlemi Yapan:</span> {fis.user || '-'}</div>
      </div>
      <h2 className="text-lg font-bold mt-6 mb-2">Ürünler</h2>
      <table className="w-full border rounded shadow bg-white dark:bg-gray-900 mb-4">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="py-2 px-4 text-left">Ürün Adı</th>
            <th className="py-2 px-4 text-center">Miktar</th>
            <th className="py-2 px-4 text-center">Birim Fiyat</th>
            <th className="py-2 px-4 text-center">Toplam</th>
          </tr>
        </thead>
        <tbody>
          {fis.items && fis.items.length > 0 ? fis.items.map((item, i) => (
            <tr key={item._id || i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"}>
              <td className="py-2 px-4">{item.productName || '-'}</td>
              <td className="py-2 px-4 text-center">{item.quantity || 0}</td>
              <td className="py-2 px-4 text-center">{item.unitPrice?.toFixed(2) || '0.00'}₺</td>
              <td className="py-2 px-4 text-center">{item.totalPrice?.toFixed(2) || '0.00'}₺</td>
            </tr>
          )) : (
            <tr><td colSpan={4} className="text-center py-4">Ürün yok</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}