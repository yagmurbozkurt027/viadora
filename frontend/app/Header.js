"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [isDark, setIsDark] = useState(false);
  const [role, setRole] = useState("user");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Karanlık mod kontrolü
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    
    checkTheme();
    
    // Kullanıcı bilgilerini al
    const userRole = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    
    if (userRole) setRole(userRole);
    if (token && userId) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    // Intersection Observer için
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    });
    
    // Theme değişikliklerini dinle
    const themeObserver = new MutationObserver(checkTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // localStorage değişikliklerini dinle
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const userRole = localStorage.getItem("role");
      
      if (token && userId) {
        setIsLoggedIn(true);
        if (userRole) setRole(userRole);
      } else {
        setIsLoggedIn(false);
        setRole("user");
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      observer.disconnect();
      themeObserver.disconnect();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  const logoSrc = "/WhatsApp_Görsel_2025-08-06_saat_14.46.29_44ec4450-removebg-preview-removebg-preview.png";

  return (
    <header className={`flex items-center justify-between px-2 md:px-4 py-3 shadow-lg border-b transition-colors duration-300 ${
      isDark 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-2">
        <img
          src={logoSrc}
          alt="Viadora Logo"
          className="w-12 h-12 object-contain rounded-full shadow-lg bg-white/80 p-1 cursor-pointer"
          onClick={() => setShowLogoModal(true)}
        />
        {showLogoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="relative">
              <button
                onClick={() => setShowLogoModal(false)}
                className="absolute -top-6 -right-6 bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg"
              >
                ×
              </button>
              <img
                src={logoSrc}
                alt="Viadora Logo Büyük"
                className="w-[350px] h-[350px] md:w-[450px] md:h-[450px] object-contain rounded-2xl shadow-2xl bg-white/90 p-6"
              />
            </div>
          </div>
        )}
        <div className={`text-sm md:text-lg font-bold transition-colors ${
          isDark ? 'text-blue-400' : 'text-blue-600'
        }`}>
          Viadora
        </div>
      </div>
      
      {/* Mobile Menü Butonu */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 rounded-lg border transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      {/* Desktop Menü */}
      <nav className="hidden md:flex gap-3 items-center text-xs md:text-sm">
        <Link href="/" className={`transition-colors ${
          isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
        }`}>
          Anasayfa
        </Link>
        <Link href="/urunler" className={`transition-colors ${
          isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
        }`}>
          Ürünler
        </Link>
        <Link href="/stoklarim" className={`transition-colors ${
          isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
        }`}>
          Stoklarım
        </Link>
        {/* Fişlerim Dropdown kaldırıldı, sadece Yeni Fiş Ekle görünecek */}
        <Link href="/fis-ekle" className={`transition-colors ${
          isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
        }`}>
          Yeni Fiş Ekle
        </Link>
        <Link href="/barkod" className={`transition-colors ${
          isDark ? 'text-gray-300 hover:text-purple-400' : 'text-gray-700 hover:text-purple-600'
        }`}>
          🏷️ Barkod
        </Link>
        <Link href="/fatura" className={`transition-colors ${
          isDark ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-700 hover:text-indigo-600'
        }`}>
          📄 Fatura
        </Link>
        <Link href="/mal-kabul" className={`transition-colors ${
          isDark ? 'text-gray-300 hover:text-green-400' : 'text-gray-700 hover:text-green-600'
        }`}>
          📦 Mal Kabul
        </Link>
        <Link href="/favoriler" className={`transition-colors ${
          isDark ? 'text-gray-300 hover:text-pink-400' : 'text-gray-700 hover:text-pink-600'
        }`}>
          Favorilerim
        </Link>
        <Link href="/gamification" className={`transition-colors ${
          isDark ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-700 hover:text-yellow-600'
        }`}>
          🎮 Gamification
        </Link>
        <Link href="/tanitim" className={`transition-colors ${
          isDark ? 'text-gray-300 hover:text-cyan-400' : 'text-gray-700 hover:text-cyan-600'
        }`}>
          🌟 Tanıtım
        </Link>
        <Link href="/profil" className={`transition-colors ${
          isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
        }`}>
          Profilim
        </Link>
        {role === "admin" && (
          <>
            <Link href="/admin" className={`font-bold transition-colors ${
              isDark ? 'text-gray-300 hover:text-red-400' : 'text-gray-700 hover:text-red-600'
            }`}>
              Admin Paneli
            </Link>
            <Link href="/raporlar" className={`font-bold transition-colors ${
              isDark ? 'text-gray-300 hover:text-green-400' : 'text-gray-700 hover:text-green-600'
            }`}>
              📊 Raporlar
            </Link>
          </>
        )}
        {isLoggedIn ? (
          <button
            className={`ml-4 px-3 py-1 rounded text-white transition-colors ${
              isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
            }`}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              localStorage.removeItem("username");
              localStorage.removeItem("role");
              setIsLoggedIn(false);
              window.location.href = "/login";
            }}
          >
            Çıkış Yap
          </button>
        ) : (
          <Link
            href="/login"
            className={`ml-4 px-3 py-1 rounded text-white transition-colors ${
              isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            Giriş Yap
          </Link>
        )}
        <button
          onClick={toggleDarkMode}
          className={`ml-4 px-3 py-1 rounded border transition-colors ${
            isDark 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300'
          }`}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </nav>
      
      {/* Mobile Menü */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg md:hidden z-50">
          <nav className="flex flex-col p-4 space-y-2">
            <Link href="/" className={`py-2 px-4 rounded-lg transition-colors ${
              isDark ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
            }`}>
              🏠 Anasayfa
            </Link>
            <Link href="/urunler" className={`py-2 px-4 rounded-lg transition-colors ${
              isDark ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
            }`}>
              🛍️ Ürünler
            </Link>
            <Link href="/stoklarim" className={`py-2 px-4 rounded-lg transition-colors ${
              isDark ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
            }`}>
              📦 Stoklarım
            </Link>
            <Link href="/fis-ekle" className={`py-2 px-4 rounded-lg transition-colors ${
              isDark ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
            }`}>
              📝 Yeni Fiş Ekle
            </Link>
            <Link href="/barkod" className={`py-2 px-4 rounded-lg transition-colors ${
              isDark ? 'text-gray-300 hover:text-purple-400 hover:bg-gray-800' : 'text-gray-700 hover:text-purple-600 hover:bg-gray-100'
            }`}>
              🏷️ Barkod
            </Link>
            <Link href="/fatura" className={`py-2 px-4 rounded-lg transition-colors ${
              isDark ? 'text-gray-300 hover:text-indigo-400 hover:bg-gray-800' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-100'
            }`}>
              📄 Fatura
            </Link>
            <Link href="/mal-kabul" className={`py-2 px-4 rounded-lg transition-colors ${
              isDark ? 'text-gray-300 hover:text-green-400 hover:bg-gray-800' : 'text-gray-700 hover:text-green-600 hover:bg-gray-100'
            }`}>
              📦 Mal Kabul
            </Link>
            <Link href="/favoriler" className={`py-2 px-4 rounded-lg transition-colors ${
              isDark ? 'text-gray-300 hover:text-pink-400 hover:bg-gray-800' : 'text-gray-700 hover:text-pink-600 hover:bg-gray-100'
            }`}>
              ❤️ Favorilerim
            </Link>
            <Link href="/gamification" className={`py-2 px-4 rounded-lg transition-colors ${
              isDark ? 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800' : 'text-gray-700 hover:text-yellow-600 hover:bg-gray-100'
            }`}>
              🎮 Gamification
            </Link>
            <Link href="/tanitim" className={`py-2 px-4 rounded-lg transition-colors ${
              isDark ? 'text-gray-300 hover:text-cyan-400 hover:bg-gray-800' : 'text-gray-700 hover:text-cyan-600 hover:bg-gray-100'
            }`}>
              🌟 Tanıtım
            </Link>
            <Link href="/profil" className={`py-2 px-4 rounded-lg transition-colors ${
              isDark ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
            }`}>
              👤 Profilim
            </Link>
            {role === "admin" && (
              <>
                <Link href="/admin" className={`py-2 px-4 rounded-lg transition-colors font-bold ${
                  isDark ? 'text-gray-300 hover:text-red-400 hover:bg-gray-800' : 'text-gray-700 hover:text-red-600 hover:bg-gray-100'
                }`}>
                  🔧 Admin Paneli
                </Link>
                <Link href="/raporlar" className={`py-2 px-4 rounded-lg transition-colors font-bold ${
                  isDark ? 'text-gray-300 hover:text-green-400 hover:bg-gray-800' : 'text-gray-700 hover:text-green-600 hover:bg-gray-100'
                }`}>
                  📊 Raporlar
                </Link>
              </>
            )}
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              {isLoggedIn ? (
                <button
                  className={`flex-1 px-3 py-2 rounded text-white transition-colors ${
                    isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                  }`}
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    localStorage.removeItem("username");
                    localStorage.removeItem("role");
                    setIsLoggedIn(false);
                    window.location.href = "/login";
                  }}
                >
                  🚪 Çıkış Yap
                </button>
              ) : (
                <Link
                  href="/login"
                  className={`flex-1 px-3 py-2 rounded text-white transition-colors text-center ${
                    isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  🔑 Giriş Yap
                </Link>
              )}
              <button
                onClick={toggleDarkMode}
                className={`px-3 py-2 rounded border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-300'
                }`}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}