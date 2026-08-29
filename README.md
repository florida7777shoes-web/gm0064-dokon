# GM_0064 — Shaxsiy Do'kon Boshqaruv Tizimi

Avtoehtiyot qismlar do'koni uchun to'liq boshqaruv tizimi: sotuv (kassa), ombor,
mijozlar/qarz daftari, xodimlar va hisobotlar. Veb-ilova (PWA) sifatida qurilgan —
istalgan telefon yoki kompyuterdan, brauzer orqali ishlaydi va telefonga "ilova"
sifatida o'rnatiladi.

## Tuzilma

```
gm0064-shop/
├── server/     ← Backend (Node.js + Express + SQLite)
└── client/     ← Frontend (React + Vite, PWA)
```

---

## 1-QADAM: Kompyuterda ishga tushirish (Visual Studio / VS Code)

### Talablar
- [Node.js](https://nodejs.org) o'rnatilgan bo'lishi kerak (v18 yoki undan yuqori)
- Visual Studio yoki Visual Studio Code (bu loyiha oddiy JavaScript loyihasi
  bo'lgani uchun VS Code tavsiya etiladi — "File → Open Folder" orqali oching)

### Serverni ishga tushirish
```bash
cd server
npm install
npm run dev
```
Server `http://localhost:4000` da ishga tushadi. Birinchi marta ishga tushganda
avtomatik admin hisobi yaratiladi:
- **Login:** `admin`
- **Parol:** `admin123`

⚠️ Birinchi kirishdan so'ng, Xodimlar bo'limidan yangi admin yaratib, eski parolni
almashtirishni tavsiya qilamiz (parolni to'g'ridan-to'g'ri o'zgartirish funksiyasi
hozircha yo'q, buni keyingi bosqichda qo'shish mumkin).

### Clientni ishga tushirish (boshqa terminalda)
```bash
cd client
npm install
npm run dev
```
Brauzeringizda `http://localhost:5173` manzilini oching.

---

## 2-QADAM: Istalgan joydan (telefon/kompyuter) foydalanish uchun internetga chiqarish

Dasturni doim yoniq turadigan serverga joylashtirish kerak. Eng oson va bepul
yo'llar:

### A) Backend uchun — Render.com (bepul tarif mavjud)
1. [render.com](https://render.com) da ro'yxatdan o'ting
2. Loyihangizni GitHub'ga yuklang (`git init`, `git push`)
3. Render'da "New Web Service" → GitHub repo'ni tanlang → Root Directory: `server`
4. Build Command: `npm install`, Start Command: `npm start`
5. Environment Variable qo'shing: `JWT_SECRET` = (o'zingiz tanlagan maxfiy so'z)

### B) Frontend uchun — Vercel yoki Netlify (bepul)
1. [vercel.com](https://vercel.com) da ro'yxatdan o'ting, GitHub repo'ni ulang
2. Root Directory: `client`, Build Command: `npm run build`, Output: `dist`
3. `client/vite.config.js` dagi proxy sozlamasi faqat local uchun — production'da
   `client/src/api.js` faylidagi `BASE` o'zgaruvchisini Render'dan olingan backend
   URL manzilingizga o'zgartiring (masalan: `https://gm0064-server.onrender.com/api`)

Shundan so'ng frontend'ning Vercel bergan havolasini (masalan
`https://gm0064-shop.vercel.app`) istalgan telefon yoki kompyuter brauzerida
oching — tizim ishlaydi. Telefonda brauzer menyusidan **"Bosh ekranga qo'shish"**
ni tanlasangiz, dastur xuddi oddiy ilova kabi ishlaydi (PWA).

### C) Muqobil variant — hammasi bir joyda (Railway.app)
Railway.app da ham server, ham SQLite faylini bitta joyda joylashtirib, oddiy
va tez ishga tushirish mumkin — GitHub repo ulanadi va avtomatik deploy bo'ladi.

---

## Rollar (kirish huquqlari)

| Rol       | Huquqlari |
|-----------|-----------|
| Admin     | Hammasi: mahsulot, sotuv, mijoz, xodim qo'shish/o'chirish, hisobotlar |
| Kassir    | Sotuv qilish, mijozlarni ko'rish, hisobotlarni ko'rish |
| Omborchi  | Mahsulot qo'shish/tahrirlash, sotuv qilish |

Yangi xodim qo'shish: tizimga admin sifatida kiring → **Xodimlar** bo'limi →
**+ Yangi xodim**.

## Ma'lumotlar bazasi

SQLite fayli (`server/db/shop.db`) da saqlanadi — alohida dastur o'rnatish shart
emas. Agar kelajakda ko'proq foydalanuvchi/filial bo'lsa, PostgreSQL'ga o'tish
tavsiya etiladi (Render/Railway'da bepul PostgreSQL mavjud).

## Keyingi rivojlantirish g'oyalari
- Chek chop etish (printer bilan integratsiya)
- SMS orqali mijozga qarz eslatmasi yuborish
- Mahsulot rasm(lar)ini yuklash
- Excel'ga eksport (hisobotlar)
- Bir nechta do'kon/filial qo'llab-quvvatlash
