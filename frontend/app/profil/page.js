'use client';
import { useEffect, useState } from "react";
// import { usePushNotifications } from '../hooks/usePushNotifications';

export default function ProfilePage() {
  const [user, setUser] = useState({ 
    username: "", 
    email: "", 
    phone: "", 
    birthDate: "", 
    gender: "erkek",
    address: {
      city: "",
      district: "",
      postalCode: "",
      fullAddress: ""
    },
    twoFactorEnabled: false,
    passwordStrength: 0,
    notifications: {
      emailNotifications: true,
      priceAlerts: true,
      gamificationUpdates: true,
      marketingEmails: false,
      sms: false,
      push: true,
      security: true
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showPhone: false,
      showBirthDate: false,
      allowSearch: true,
      dataSharing: false
    }
  });
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ 
    username: "", 
    email: "", 
    phone: "", 
    birthDate: "", 
    gender: "erkek",
    address: {
      city: "",
      district: "",
      postalCode: "",
      fullAddress: ""
    },
    notifications: {
      emailNotifications: true,
      priceAlerts: true,
      gamificationUpdates: true,
      marketingEmails: false,
      sms: false,
      push: true,
      security: true
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showPhone: false,
      showBirthDate: false,
      allowSearch: true,
      dataSharing: false
    }
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ old: "", new: "", again: "" });
  const [passwordMessage, setPasswordMessage] = useState("");
  // const [photo, setPhoto] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState("");
  
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showLoginHistory, setShowLoginHistory] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [loginHistory, setLoginHistory] = useState([]);
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  // const pushNotifications = usePushNotifications();

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/users/profile/${userId}`);
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          const userData = {
            username: data.username || "Kullanıcı",
            email: data.email || "eposta@ornek.com",
            phone: data.phone || "",
            birthDate: data.birthDate || "",
            gender: data.gender || "erkek",
            address: data.address || {
              city: "",
              district: "",
              postalCode: "",
              fullAddress: ""
            },
            twoFactorEnabled: data.twoFactorEnabled || false,
            passwordStrength: data.passwordStrength || 0,
            notifications: data.notifications || {
              email: true,
              sms: false,
              push: true,
              marketing: false,
              security: true
            },
            privacy: data.privacy || {
              profileVisible: true,
              showEmail: false,
              showPhone: false,
              showBirthDate: false,
              allowSearch: true,
              dataSharing: false
            }
          };
          setUser(userData);
          setForm(userData);
          
          // localStorage'a da kaydet
          localStorage.setItem("username", userData.username);
          localStorage.setItem("email", userData.email);
          localStorage.setItem("phone", userData.phone);
          localStorage.setItem("birthDate", userData.birthDate);
          localStorage.setItem("gender", userData.gender);
          localStorage.setItem("address", JSON.stringify(userData.address));
        } catch (err) {
          console.error("Kullanıcı bilgileri çekilemedi:", err);
          // Hata durumunda localStorage'dan al
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }
    };

    const loadFromLocalStorage = () => {
      const username = localStorage.getItem("username") || "Kullanıcı";
      const email = localStorage.getItem("email") || "eposta@ornek.com";
      const phone = localStorage.getItem("phone") || "";
      const birthDate = localStorage.getItem("birthDate") || "";
      const gender = localStorage.getItem("gender") || "erkek";
      const address = JSON.parse(localStorage.getItem("address") || '{"city":"","district":"","postalCode":"","fullAddress":""}');
      
      setUser({ username, email, phone, birthDate, gender, address });
      setForm({ username, email, phone, birthDate, gender, address });
    };

    fetchUserData();
    
    // Profil fotoğrafı ile ilgili state ve fonksiyonları kaldır

    const savedAddresses = JSON.parse(localStorage.getItem("addresses") || "[]");
    setAddresses(savedAddresses);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (name.startsWith('notifications.')) {
      const notificationField = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationField]: e.target.checked
        }
      }));
    } else if (name.startsWith('privacy.')) {
      const privacyField = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        privacy: {
          ...prev.privacy,
          [privacyField]: e.target.checked
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/users/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          username: form.username,
          email: form.email,
          phone: form.phone,
          birthDate: form.birthDate,
          gender: form.gender,
          address: form.address,
          notifications: form.notifications,
          privacy: form.privacy
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("phone", data.user.phone);
        localStorage.setItem("birthDate", data.user.birthDate);
        localStorage.setItem("gender", data.user.gender);
        localStorage.setItem("address", JSON.stringify(data.user.address));
        setEditMode(false);
        alert("Profil başarıyla güncellendi!");
      } else {
        alert(data.error || "Bir hata oluştu.");
      }
    } catch (err) {
      alert("Sunucu hatası!");
    }
  };

          const setup2FA = async () => {
    const userId = localStorage.getItem("userId");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/users/setup-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setTwoFactorSecret(data.secret);
        setShow2FASetup(true);
      } else {
        alert(data.error || "2FA kurulumu başarısız.");
      }
    } catch (err) {
      alert("Sunucu hatası!");
    }
  };

          const verify2FA = async () => {
    const userId = localStorage.getItem("userId");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/users/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token: twoFactorToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(prev => ({ ...prev, twoFactorEnabled: true }));
        setShow2FASetup(false);
        setTwoFactorToken("");
        alert("2FA başarıyla etkinleştirildi!");
      } else {
        alert(data.error || "Geçersiz kod.");
      }
    } catch (err) {
      alert("Sunucu hatası!");
    }
  };

          const fetchLoginHistory = async () => {
    const userId = localStorage.getItem("userId");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/users/login-history/${userId}`);
      const data = await res.json();
      if (res.ok) {
        setLoginHistory(data.loginHistory);
        setShowLoginHistory(true);
      } else {
        alert(data.error || "Giriş geçmişi alınamadı.");
      }
    } catch (err) {
      alert("Sunucu hatası!");
    }
  };

          const checkPasswordStrength = async (password) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6602'}/api/users/check-password-strength`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordStrength(data.strength);
      }
    } catch (err) {
      console.error("Şifre gücü kontrol edilemedi:", err);
    }
  };

          const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new.length < 4) {
      setPasswordMessage("Yeni şifre en az 4 karakter olmalı.");
      return;
    }
    if (passwords.new !== passwords.again) {
      setPasswordMessage("Yeni şifreler eşleşmiyor.");
      return;
    }
    
    await checkPasswordStrength(passwords.new);
    
    localStorage.setItem("password", passwords.new);
    setPasswordMessage("Şifre başarıyla değiştirildi!");
    setPasswords({ old: "", new: "", again: "" });
    setShowPasswordForm(false);
  };

  // const handlePhotoChange = (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;
  //   const reader = new FileReader();
  //   reader.onload = (ev) => {
  //     setPhoto(ev.target.result);
  //     const userId = localStorage.getItem("userId");
  //     localStorage.setItem(`profilePhoto_${userId}`, ev.target.result);
  //             window.location.reload();
  //   };
  //   reader.readAsDataURL(file);
  // };

  const addAddress = (address) => {
    const updated = [...addresses, address];
    setAddresses(updated);
    localStorage.setItem("addresses", JSON.stringify(updated));
  };

  const removeAddress = (index) => {
    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);
    localStorage.setItem("addresses", JSON.stringify(updated));
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 40) return "bg-red-500";
    if (strength < 60) return "bg-orange-500";
    if (strength < 80) return "bg-yellow-500";
    if (strength < 90) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 40) return "Çok zayıf";
    if (strength < 60) return "Zayıf";
    if (strength < 80) return "Orta";
    if (strength < 90) return "Güçlü";
    return "Çok güçlü";
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded shadow text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Profilim</h1>
      
      {/* Profil Fotoğrafı */}
      {/* Bu kısmı tamamen kaldırıyoruz */}

      {/* Ana Bilgiler */}
      {!editMode ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="mb-2">
              <span className="font-semibold text-gray-900 dark:text-white">Kullanıcı Adı:</span> <span className="text-gray-700 dark:text-gray-300">{user.username}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-900 dark:text-white">E-posta:</span> <span className="text-gray-700 dark:text-gray-300">{user.email}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-900 dark:text-white">Telefon:</span> <span className="text-gray-700 dark:text-gray-300">{user.phone || "Belirtilmemiş"}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-900 dark:text-white">Doğum Tarihi:</span> <span className="text-gray-700 dark:text-gray-300">{user.birthDate ? new Date(user.birthDate).toLocaleDateString('tr-TR') : "Belirtilmemiş"}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-900 dark:text-white">Cinsiyet:</span> <span className="text-gray-700 dark:text-gray-300">{user.gender}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-900 dark:text-white">2FA Durumu:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${user.twoFactorEnabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                {user.twoFactorEnabled ? 'Aktif' : 'Pasif'}
              </span>
            </div>
          </div>
          
          {/* Adres Bilgileri */}
          {user.address && (user.address.city || user.address.district) && (
            <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Adres Bilgileri:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {user.address.city && <div><span className="font-medium text-gray-900 dark:text-white">Şehir:</span> <span className="text-gray-700 dark:text-gray-300">{user.address.city}</span></div>}
                {user.address.district && <div><span className="font-medium text-gray-900 dark:text-white">İlçe:</span> <span className="text-gray-700 dark:text-gray-300">{user.address.district}</span></div>}
                {user.address.postalCode && <div><span className="font-medium text-gray-900 dark:text-white">Posta Kodu:</span> <span className="text-gray-700 dark:text-gray-300">{user.address.postalCode}</span></div>}
                {user.address.fullAddress && <div className="md:col-span-2"><span className="font-medium text-gray-900 dark:text-white">Tam Adres:</span> <span className="text-gray-700 dark:text-gray-300">{user.address.fullAddress}</span></div>}
              </div>
            </div>
          )}
          
          {/* Güvenlik Butonları */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              onClick={() => setEditMode(true)}
            >
              Profili Düzenle
            </button>
            <button
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              Şifre Değiştir
            </button>
            <button
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors"
              onClick={setup2FA}
            >
              {user.twoFactorEnabled ? '2FA Ayarları' : '2FA Kur'}
            </button>
            <button
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
              onClick={fetchLoginHistory}
            >
              Giriş Geçmişi
            </button>
            <button
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
              onClick={() => setShowNotifications(true)}
            >
              Bildirimler
            </button>
            <button
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded transition-colors"
              onClick={() => setShowNotificationModal(true)}
            >
              🔔 Bildirim Tercihleri
            </button>
            <button
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
              onClick={() => setShowPrivacy(true)}
            >
              Gizlilik
            </button>
            
            {/* Push Notification Butonu */}
            {/* {pushNotifications.isSupported && (
              <button
                className={`px-4 py-2 rounded transition-colors ${
                  pushNotifications.permission === 'granted'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }`}
                onClick={async () => {
                  try {
                    if (pushNotifications.permission === 'granted') {
                      await pushNotifications.sendTestNotification();
                      alert('Test bildirimi gönderildi!');
                    } else {
                      await pushNotifications.requestPermission();
                      alert('Bildirim izni istendi!');
                    }
                  } catch (error) {
                    alert('Hata: ' + error.message);
                  }
                }}
                disabled={pushNotifications.isLoading}
              >
                {pushNotifications.isLoading ? '⏳ Yükleniyor...' : 
                 pushNotifications.permission === 'granted' ? '🔔 Test Bildirimi' : 
                 '🔔 Bildirim İzni'}
              </button>
            )} */}
          </div>
        </>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-900 dark:text-white">Kullanıcı Adı:</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-gray-900 dark:text-white">E-posta:</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-gray-900 dark:text-white">Telefon:</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0555 123 45 67"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-900 dark:text-white">Doğum Tarihi:</label>
              <input
                type="date"
                name="birthDate"
                value={form.birthDate}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-900 dark:text-white">Cinsiyet:</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="erkek">Erkek</option>
                <option value="kadın">Kadın</option>
                <option value="diğer">Diğer</option>
              </select>
            </div>
          </div>
          
          {/* Adres Bilgileri */}
          <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Adres Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-gray-900 dark:text-white">Şehir:</label>
                <input
                  type="text"
                  name="address.city"
                  value={form.address.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-900 dark:text-white">İlçe:</label>
                <input
                  type="text"
                  name="address.district"
                  value={form.address.district}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-900 dark:text-white">Posta Kodu:</label>
                <input
                  type="text"
                  name="address.postalCode"
                  value={form.address.postalCode}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="font-semibold text-gray-900 dark:text-white">Tam Adres:</label>
              <textarea
                name="address.fullAddress"
                value={form.address.fullAddress}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 h-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Sokak, mahalle, bina no vb."
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
            >
              Kaydet
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white rounded transition-colors"
              onClick={() => setEditMode(false)}
            >
              İptal
            </button>
          </div>
        </form>
      )}

      {/* Şifre Değiştirme Formu */}
      {showPasswordForm && (
        <div className="mt-6 p-4 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Şifre Değiştir</h3>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="font-semibold text-gray-900 dark:text-white">Yeni Şifre:</label>
              <input
                type="password"
                value={passwords.new}
                onChange={e => {
                  setPasswords({ ...passwords, new: e.target.value });
                  checkPasswordStrength(e.target.value);
                }}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              {passwordStrength > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getPasswordStrengthColor(passwordStrength)}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{passwordStrength}%</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{getPasswordStrengthText(passwordStrength)}</span>
                </div>
              )}
            </div>
            <div>
              <label className="font-semibold text-gray-900 dark:text-white">Yeni Şifre (Tekrar):</label>
              <input
                type="password"
                value={passwords.again}
                onChange={e => setPasswords({ ...passwords, again: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
              >
                Kaydet
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white rounded transition-colors"
                onClick={() => setShowPasswordForm(false)}
              >
                İptal
              </button>
            </div>
            {passwordMessage && (
              <div className="text-sm text-red-600 dark:text-red-400">{passwordMessage}</div>
            )}
          </form>
        </div>
      )}

      {/* 2FA Kurulum Modal */}
      {show2FASetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 text-gray-900 dark:text-white">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">İki Faktörlü Doğrulama Kurulumu</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                1. Google Authenticator uygulamasını açın
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                2. QR kodu tarayın veya kodu manuel girin:
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center font-mono text-sm text-gray-900 dark:text-white">
                {twoFactorSecret}
              </div>
            </div>
            <div className="mb-4">
              <label className="font-semibold text-gray-900 dark:text-white">Doğrulama Kodu:</label>
              <input
                type="text"
                value={twoFactorToken}
                onChange={e => setTwoFactorToken(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="6 haneli kod"
                maxLength="6"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={verify2FA}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
              >
                Doğrula
              </button>
              <button
                onClick={() => {
                  setShow2FASetup(false);
                  setTwoFactorToken("");
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white rounded transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Giriş Geçmişi Modal */}
      {showLoginHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto text-gray-900 dark:text-white">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Giriş Geçmişi</h3>
            {loginHistory.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">Henüz giriş geçmişi yok.</p>
            ) : (
              <div className="space-y-2">
                {loginHistory.map((login, index) => (
                  <div key={index} className="border border-gray-300 dark:border-gray-600 rounded p-3 bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{login.browser}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{login.device}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{login.ip}</div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded text-xs ${login.success ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                          {login.success ? 'Başarılı' : 'Başarısız'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {new Date(login.timestamp).toLocaleString('tr-TR')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowLoginHistory(false)}
              className="mt-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white rounded transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Bildirim Tercihleri Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 text-gray-900 dark:text-white">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Bildirim Tercihleri</h3>
            <div className="space-y-3">
              <label className="flex items-center text-gray-900 dark:text-white">
                <input
                  type="checkbox"
                  name="notifications.email"
                  checked={form.notifications.email}
                  onChange={handleChange}
                  className="mr-2"
                />
                E-posta bildirimleri
              </label>
              <label className="flex items-center text-gray-900 dark:text-white">
                <input
                  type="checkbox"
                  name="notifications.sms"
                  checked={form.notifications.sms}
                  onChange={handleChange}
                  className="mr-2"
                />
                SMS bildirimleri
              </label>
              <label className="flex items-center text-gray-900 dark:text-white">
                <input
                  type="checkbox"
                  name="notifications.push"
                  checked={form.notifications.push}
                  onChange={handleChange}
                  className="mr-2"
                />
                Push bildirimleri
              </label>
              <label className="flex items-center text-gray-900 dark:text-white">
                <input
                  type="checkbox"
                  name="notifications.marketing"
                  checked={form.notifications.marketing}
                  onChange={handleChange}
                  className="mr-2"
                />
                Pazarlama bildirimleri
              </label>
              <label className="flex items-center text-gray-900 dark:text-white">
                <input
                  type="checkbox"
                  name="notifications.security"
                  checked={form.notifications.security}
                  onChange={handleChange}
                  className="mr-2"
                />
                Güvenlik bildirimleri
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowNotifications(false)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                Kaydet
              </button>
              <button
                onClick={() => setShowNotifications(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white rounded transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gizlilik Ayarları Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 text-gray-900 dark:text-white">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Gizlilik Ayarları</h3>
            <div className="space-y-3">
              <label className="flex items-center text-gray-900 dark:text-white">
                <input
                  type="checkbox"
                  name="privacy.profileVisible"
                  checked={form.privacy.profileVisible}
                  onChange={handleChange}
                  className="mr-2"
                />
                Profilimi görünür yap
              </label>
              <label className="flex items-center text-gray-900 dark:text-white">
                <input
                  type="checkbox"
                  name="privacy.showEmail"
                  checked={form.privacy.showEmail}
                  onChange={handleChange}
                  className="mr-2"
                />
                E-posta adresimi göster
              </label>
              <label className="flex items-center text-gray-900 dark:text-white">
                <input
                  type="checkbox"
                  name="privacy.showPhone"
                  checked={form.privacy.showPhone}
                  onChange={handleChange}
                  className="mr-2"
                />
                Telefon numaramı göster
              </label>
              <label className="flex items-center text-gray-900 dark:text-white">
                <input
                  type="checkbox"
                  name="privacy.showBirthDate"
                  checked={form.privacy.showBirthDate}
                  onChange={handleChange}
                  className="mr-2"
                />
                Doğum tarihimi göster
              </label>
              <label className="flex items-center text-gray-900 dark:text-white">
                <input
                  type="checkbox"
                  name="privacy.allowSearch"
                  checked={form.privacy.allowSearch}
                  onChange={handleChange}
                  className="mr-2"
                />
                Arama sonuçlarında göster
              </label>
              <label className="flex items-center text-gray-900 dark:text-white">
                <input
                  type="checkbox"
                  name="privacy.dataSharing"
                  checked={form.privacy.dataSharing}
                  onChange={handleChange}
                  className="mr-2"
                />
                Veri paylaşımına izin ver
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowPrivacy(false)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                Kaydet
              </button>
              <button
                onClick={() => setShowPrivacy(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white rounded transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Bildirim Tercihleri Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 text-gray-900 dark:text-white">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">🔔 Bildirim Tercihleri</h3>
            <div className="space-y-3">
              <label className="flex items-center text-gray-900 dark:text-white">
                <input
                  type="checkbox"
                  name="notifications.emailNotifications"
                  checked={form.notifications.emailNotifications}
                  onChange={handleChange}
                  className="mr-2"
                />
                E-posta bildirimleri
              </label>
              <label className="flex items-center text-gray-900 dark:text-white">
                <input
                  type="checkbox"
                  name="notifications.priceAlerts"
                  checked={form.notifications.priceAlerts}
                  onChange={handleChange}
                  className="mr-2"
                />
                Fiyat düşüşü uyarıları
              </label>
              <label className="flex items-center text-gray-900 dark:text-white">
                <input
                  type="checkbox"
                  name="notifications.gamificationUpdates"
                  checked={form.notifications.gamificationUpdates}
                  onChange={handleChange}
                  className="mr-2"
                />
                Gamification güncellemeleri
              </label>
              <label className="flex items-center text-gray-900 dark:text-white">
                <input
                  type="checkbox"
                  name="notifications.marketingEmails"
                  checked={form.notifications.marketingEmails}
                  onChange={handleChange}
                  className="mr-2"
                />
                Pazarlama e-postaları
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                Kaydet
              </button>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white rounded transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Adresler Bölümü */}
      <h2 className="text-xl font-bold mt-8 mb-2 text-gray-900 dark:text-white">Adreslerim</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (newAddress.trim()) {
            addAddress(newAddress.trim());
            setNewAddress("");
          }
        }}
        className="mb-4"
      >
        <input
          type="text"
          value={newAddress}
          onChange={e => setNewAddress(e.target.value)}
          placeholder="Yeni adres ekle"
          className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 mr-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors">Ekle</button>
      </form>
      <ul className="text-gray-900 dark:text-white">
        {addresses.length === 0 && <li className="text-gray-600 dark:text-gray-400">Henüz adresiniz yok.</li>}
        {addresses.map((addr, i) => (
          <li key={i} className="mb-2 flex items-center text-gray-900 dark:text-white">
            <span className="flex-1">{addr}</span>
            <button
              onClick={() => removeAddress(i)}
              className="ml-2 text-red-500 hover:text-red-600 transition-colors"
            >Sil</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
