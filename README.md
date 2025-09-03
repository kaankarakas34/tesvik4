# Teşvik360 - Teşvik Yönetim Sistemi

## Proje Açıklaması

Teşvik360, Türkiye'deki şirketlerin devlet teşviki süreçlerini dijitalleştiren, onları uzman danışmanlarla buluşturan ve tüm başvuru sürecini şeffaf, hızlı ve yönetilebilir hale getiren SaaS platformudur.

## Özellikler

### Kullanıcı Rolleri
- **Şirket**: Teşvik başvuruları oluşturabilir ve takip edebilir
- **Danışman**: Şirketlere rehberlik eder ve başvuru süreçlerini yönetir  
- **Admin**: Tüm sistemi yönetir ve kullanıcıları onaylar

### Temel Fonksiyonlar
- JWT + Refresh Token ile güvenli kimlik doğrulama
- Rol tabanlı yetkilendirme
- Admin onayı gerektiren kullanıcı kaydı
- Responsive modern UI tasarımı
- PostgreSQL veritabanı
- Docker containerization

## Teknoloji Stack

### Backend
- Node.js + Express.js
- PostgreSQL + Sequelize ORM
- JWT Authentication
- bcryptjs for password hashing
- express-validator for validation
- Docker & Docker Compose

### Frontend
- React 19 + TypeScript
- Styled Components
- React Router DOM
- Axios for API calls
- Context API for state management

## Kurulum

### Ön Gereksinimler
- Node.js (18+)
- Docker & Docker Compose
- Git

### 1. Proje Klonlama
```bash
git clone <repository-url>
cd tesvik360
```

### 2. Docker ile Çalıştırma

Backend ve veritabanını çalıştırın:
```bash
docker-compose up -d
```

Bu komut:
- PostgreSQL veritabanını port 5432'de başlatır
- Backend API'sini port 5000'de başlatır

### 3. Frontend Çalıştırma

Yeni terminal açın:
```bash
cd frontend
npm install
npm start
```

Frontend port 3000'de çalışacaktır.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/refresh` - Token yenileme
- `POST /api/auth/logout` - Çıkış
- `GET /api/auth/profile` - Profil bilgileri

### Health Check
- `GET /api/health` - API sağlık kontrolü

## Veritabanı Şeması

### Temel Tablolar
- `users` - Kullanıcı bilgileri
- `incentives` - Teşvik tanımları
- `documents` - Belge türleri
- `applications` - Teşvik başvuruları
- `messages` - Sohbet mesajları
- `tickets` - Destek talepleri
- `posts` - Mevzuat/Blog yazıları

### İlişki Tabloları
- `IncentiveRequiredDocuments` - Teşvik-Belge ilişkisi
- `ApplicationIncentives` - Başvuru-Teşvik ilişkisi

## Geliştirme Aşamaları

### ✅ Faz 1: Temel Altyapı (Tamamlandı)
- [x] Proje yapısı ve Docker kurulumu
- [x] Backend API ve veritabanı şeması
- [x] JWT Authentication sistemi
- [x] React frontend temel yapısı
- [x] Login/Register sayfaları

### 🔄 Faz 2: Şirket Kullanıcısı Akışı (Sonraki)
- [ ] Admin paneli - Teşvik yönetimi
- [ ] Şirket dashboard'u
- [ ] Teşvik başvuru süreci
- [ ] Belge yükleme sistemi

### 📋 Faz 3: Danışman ve Admin Paneli
- [ ] Danışman dashboard'u
- [ ] Başvuru atama sistemi
- [ ] Admin kullanıcı yönetimi
- [ ] Ticket sistemi

### 🚀 Faz 4: İçerik Yönetimi ve Tamamlama
- [ ] Mevzuat/Blog modülü
- [ ] Bildirim sistemi
- [ ] Responsive optimizasyon
- [ ] Test ve deployment

## Ortam Değişkenleri

### Backend (.env)
```
NODE_ENV=development
DATABASE_URL=postgresql://tesvik_admin:GucluSifre!2025@localhost:5432/tesvik_platformu_db
JWT_SECRET=tesvik_jwt_secret_key_2025
JWT_REFRESH_SECRET=tesvik_refresh_secret_key_2025
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d
PORT=5000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Test Kullanıcıları

Sistem üzerinde test yapmak için:
1. `/register` sayfasından hesap oluşturun
2. Admin onayı için bekleyin (veritabanında manuel olarak `status`'u `active` yapın)
3. `/login` sayfasından giriş yapın

## Development Commands

### Backend
```bash
cd backend
npm install
npm run dev          # Development server
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
```

### Frontend
```bash
cd frontend
npm install
npm start            # Development server
npm run build        # Production build
```

### Docker
```bash
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose logs backend-api   # View backend logs
docker-compose logs postgres-db   # View database logs
```

## Lisans

Bu proje özel bir proje olup, ticari kullanım için izin gereklidir.

## İletişim

Proje hakkında sorularınız için lütfen iletişime geçin.