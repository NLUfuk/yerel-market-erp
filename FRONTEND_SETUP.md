# Frontend Setup Planı

## Durum
- Backend: ✅ Tamamlandı ve çalışıyor
- Frontend Template: Horizon UI Chakra (JavaScript)
- Hedef: TypeScript migration + Backend entegrasyonu

## Adımlar

### 1. Frontend Projesi Kurulumu
- [ ] Template'i `frontend/` klasörüne kopyala
- [ ] TypeScript dependencies ekle
- [ ] `tsconfig.json` oluştur
- [ ] `.js` dosyalarını `.tsx`/`.ts`'e çevir

### 2. API Client Kurulumu
- [ ] Axios kurulumu
- [ ] API base URL config
- [ ] Request/Response interceptors
- [ ] Error handling
- [ ] Token management

### 3. Authentication
- [ ] AuthContext oluştur
- [ ] useAuth hook
- [ ] Login/Logout fonksiyonları
- [ ] Token storage (localStorage)

### 4. Routing & Protected Routes
- [ ] React Router v6 setup
- [ ] ProtectedRoute component
- [ ] Role-based route guards
- [ ] Redirect logic

### 5. Sayfalar
- [ ] Login sayfası
- [ ] Register Tenant sayfası
- [ ] Dashboard (role-based)
- [ ] Products listesi
- [ ] Products form
- [ ] Sales sayfası
- [ ] Reports sayfası
- [ ] Users yönetimi (SuperAdmin)

### 6. Components
- [ ] API entegrasyonlu table component
- [ ] Form components (yup validation)
- [ ] Loading states
- [ ] Error states
- [ ] Success notifications

### 7. Role-based Navigation
- [ ] Sidebar menu (role göre)
- [ ] Navbar (user info)
- [ ] Menu permissions

## Teknik Detaylar

### Dependencies
```json
{
  "axios": "^1.6.0",
  "@hookform/resolvers": "^3.3.0",
  "yup": "^1.3.0",
  "react-router-dom": "^6.25.1",
  "@chakra-ui/react": "2.6.1",
  "typescript": "^5.7.3",
  "@types/react": "^18.2.0"
}
```

### API Endpoints
- `POST /auth/login` - Login
- `POST /auth/register-tenant` - Tenant kayıt
- `GET /tenants` - Tenant listesi (SuperAdmin)
- `GET /products` - Ürün listesi
- `POST /products` - Ürün oluştur
- `GET /sales` - Satış listesi
- `POST /sales` - Satış oluştur
- `GET /reports/sales-summary` - Satış özeti
- `GET /reports/top-products` - En çok satan ürünler

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:4000
REACT_APP_FRONTEND_URL=http://localhost:3001
```

## Sonraki Adımlar
1. Template'i kopyala ve TypeScript'e çevir
2. API client kurulumu
3. Auth context
4. İlk sayfaları oluştur

