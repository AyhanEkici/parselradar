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
