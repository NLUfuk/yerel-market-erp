# Local Grocery Hub - Setup Guide

## ✅ PHASE 1: Backend Setup - TAMAMLANDI

### Tamamlanan İşler

1. ✅ **NestJS Proje Kurulumu**
   - NestJS CLI ile proje oluşturuldu
   - Tüm dependencies kuruldu

2. ✅ **Clean Architecture Klasör Yapısı**
   - Domain layer (entities, repositories)
   - Application layer (DTOs, use cases)
   - Infrastructure layer (TypeORM, security, config)
   - API layer (controllers, modules)

3. ✅ **Domain Entity'leri**
   - Tenant, User, Role, UserRole
   - Category, Product
   - Sale, SaleItem, StockMovement
   - Tüm entity'ler domain kurallarıyla oluşturuldu

4. ✅ **Repository Interface'leri**
   - ITenantRepository
   - IUserRepository, IRoleRepository, IUserRoleRepository
   - IProductRepository, ICategoryRepository
   - ISaleRepository, IStockMovementRepository

5. ✅ **TypeORM Entity'leri**
   - Tüm domain entity'ler için TypeORM mapping'ler
   - Database relationships tanımlandı
   - Index'ler eklendi

6. ✅ **Database Konfigürasyonu**
   - SQL Server ve SQLite desteği (TypeORM)
   - Environment variables desteği
   - DatabaseModule oluşturuldu
   - Migration sistemi kuruldu

7. ✅ **CORS & Swagger**
   - CORS configuration (main.ts)
   - Swagger documentation setup
   - Global validation pipe

8. ✅ **Database Seeding**
   - Default roles seed script'i
   - İlk SuperAdmin kullanıcısı seed script'i
   - `npm run seed` komutu hazır

---

## 🚀 Kurulum Adımları

### 1. Environment Variables

`.env` dosyası oluşturun:

```env
# Database Type: 'mssql' or 'sqlite'
DB_TYPE=mssql

# SQL Server Configuration
# Server: (localdb)\MSSQLLocalDB veya UFUK\SQLEXPRESS
DB_HOST=(localdb)\MSSQLLocalDB
DB_PORT=1433
DB_DATABASE=yerel-market-erp
# Windows Authentication için username ve password boş bırakılır
DB_USERNAME=
DB_PASSWORD=
DB_ENCRYPT=true
DB_TRUST_CERT=true
DB_SYNCHRONIZE=false
DB_LOGGING=true

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h

# App
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

**Not:** SQL Server için SSMS'de veritabanını oluşturduktan sonra `DB_HOST` ve `DB_DATABASE` değerlerini kendi sunucu ve veritabanı adınıza göre güncelleyin.

### 2. Database Migration (İlk Kurulum)

```bash
npm run migration:run
```

Bu komut tüm database tablolarını oluşturur.

### 3. Database Seeding (İlk Kurulum)

**Basic Seed (Sadece roller ve SuperAdmin):**
```bash
npm run seed
```

Bu komut:
- 4 default role oluşturur (SuperAdmin, TenantAdmin, Cashier, Viewer)
- İlk SuperAdmin kullanıcısı oluşturur:
  - Email: `admin@localgroceryhub.com`
  - Password: `Admin123!` (production'da değiştirin!)

**Demo Data Seed (Örnek tenant'lar, kullanıcılar, kategoriler ve ürünler):**
```bash
npm run seed:demo
```

Bu komut basic seed'i çalıştırır ve ek olarak:
- 2 demo tenant oluşturur:
  - **Bakkal Ahmet** (Kadıköy, İstanbul)
    - Admin: `admin@bakkal-ahmet.com` / `Demo123!`
    - Cashier: `kasiyer@bakkal-ahmet.com` / `Demo123!`
    - 4 kategori, 8 ürün
  - **Market Can** (Beşiktaş, İstanbul)
    - Admin: `admin@marketcan.com` / `Demo123!`
    - 3 kategori, 5 ürün

### 4. Uygulamayı Başlatma

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Uygulama başladığında:
- Backend: http://localhost:4000
- Swagger: http://localhost:4000/api

---

## 📁 Proje Yapısı

```
src/
├── domain/                    # Domain Layer (Pure Business Logic)
│   ├── tenants/
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── services/
│   ├── users/
│   ├── products/
│   └── sales/
│
├── application/               # Application Layer (Use Cases)
│   ├── auth/
│   ├── tenants/
│   ├── users/
│   ├── products/
│   ├── sales/
│   ├── stock/
│   ├── reports/
│   └── shared/
│
├── infrastructure/            # Infrastructure Layer
│   ├── persistence/
│   │   └── typeorm/
│   │       ├── entities/      # TypeORM entities
│   │       ├── repositories/  # Repository implementations
│   │       ├── migrations/
│   │       └── seeds/
│   ├── security/
│   ├── config/
│   └── exceptions/
│
└── api/                       # API Layer (Controllers)
    ├── auth/
    ├── tenants/
    ├── users/
    ├── products/
    ├── sales/
    ├── stock/
    └── reports/
```

---

## 🔐 İlk Kullanım

1. `.env` dosyasını oluşturun (yukarıdaki örneği kullanın)
2. `npm run migration:run` ile database tablolarını oluşturun
3. Seed çalıştırın:
   - **Basic**: `npm run seed` (sadece roller ve SuperAdmin)
   - **Demo Data**: `npm run seed:demo` (örnek tenant'lar, kullanıcılar, ürünler)
4. Uygulamayı başlatın: `npm run start:dev`
5. Swagger'a gidin: http://localhost:4000/api
6. Login yapın:
   - **SuperAdmin**: `admin@localgroceryhub.com` / `Admin123!`
   - **Demo Tenant Admin**: `admin@bakkal-ahmet.com` / `Demo123!` veya `admin@marketcan.com` / `Demo123!`

**Not**: SQLite kullanıldığı için ayrı bir database sunucusu kurulumu gerekmez. `database.sqlite` dosyası proje klasöründe otomatik oluşturulur.

---

## 📝 Sonraki Adımlar

PHASE 2: Backend Auth & Security
- JWT strategy + guards
- TenantGuard + RolesGuard
- Auth use case'leri
- Auth controller + endpoints

---

**Durum**: PHASE 1 ✅ Tamamlandı
**Sonraki**: PHASE 2'ye geçilebilir

