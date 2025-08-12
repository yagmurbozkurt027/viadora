#!/bin/bash

echo "🚀 Butik Proje Deployment Başlıyor..."

# 1. Build kontrolü
echo "📦 Build kontrolü yapılıyor..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build başarısız! Deployment durduruluyor."
    exit 1
fi

echo "✅ Build başarılı!"

# 2. Vercel'e deploy
echo "🌐 Vercel'e yükleniyor..."
vercel --prod

if [ $? -ne 0 ]; then
    echo "❌ Vercel deployment başarısız!"
    exit 1
fi

echo "✅ Deployment başarılı!"
echo "🎉 Site canlıya alındı!"
echo "🔗 URL: https://your-app.vercel.app"

# 3. Domain ayarları (opsiyonel)
echo "🌍 Custom domain ayarları için:"
echo "1. Vercel dashboard'a git"
echo "2. Settings > Domains"
echo "3. Custom domain ekle"
echo "4. DNS ayarlarını yap"

echo "✨ Deployment tamamlandı!" 