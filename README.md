# ParselRadar

Gayrimenkul Ön Kontrol ve Deal Intelligence Platformu

## Kurulum

- Docker kullanılmaz.
- MongoDB (local veya MongoDB Atlas) gereklidir.
- Gerekli environment değişkenleri için `.env.example` dosyasına bakınız.
- Kurulum için:
  - `npm install`
  - `npm run dev`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`
  - `npm run seed`
  - `npm run test`

### Stripe Webhook Local Test
Stripe webhook testleri için Stripe CLI veya test anahtarları kullanılmalıdır.

### Upload Klasörü
Yüklenen dosyalar `/uploads` klasöründe saklanır. Bu klasör herkese açık değildir, sadece sahibi ve admin erişebilir.

## U1-C — Controlled Browser Demo (First User Stripe Test)

### API & Web Service Start
- Terminal A: `npm run dev --prefix apps/api`
- Terminal B: `npm run dev --prefix apps/web`

### Stripe Webhook Listener
- Terminal C: `stripe listen --forward-to http://localhost:4000/stripe/webhook`
- Stripe CLI gereklidir. [Stripe CLI Kurulumu](https://stripe.com/docs/stripe-cli)

### Browser URL
- http://localhost:3000

### Stripe Test Card
- 4242 4242 4242 4242 (herhangi bir geçerli tarih, CVC, posta kodu)
- Gerçek kart kullanmayın, canlı modda ödeme yapmayın.

### U1-C Demo Akışı
- Kayıt ol, giriş yap
- Kredi satın al (Stripe Checkout)
- Kredi artışını doğrula
- Taşınmaz oluştur
- Online İmar Durum Belgesi yükle
- Onay ver
- Hızlı skor al
- Sadece özet alanlarının göründüğünü doğrula (fullAnalysis görünmemeli)
- PDF rapor satın al ve indir
- PDF açılabiliyor mu kontrol et
- Admin erişimi ve kullanıcı erişimi kontrol et
- Stripe CLI'da checkout.session.completed etkinliğini doğrula

### Kanıt ve Manuel Adımlar
- Stripe CLI'da webhook etkinliği görülmeli
- Kredi bakiyesi artışı gözlemlenmeli
- PDF indirilebilmeli
- fullAnalysis asla görünmemeli
- Admin/kullanıcı erişim sınırları korunmalı

### Not
- U1-C tamamlanması için manuel browser demo ve Stripe CLI gereklidir.
- .env dosyasını asla commit etmeyin.
