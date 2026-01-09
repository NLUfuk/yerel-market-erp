# Proje Mimarisi ve Veri Akışı Dokümantasyonu

## Proje Mimarisi: Clean Architecture

Proje **4 katmanlı Clean Architecture** kullanıyor:

```
src/
├── domain/          # Domain Layer (İş Mantığı - Saf)
├── application/     # Application Layer (Use Cases - İş Kuralları)
├── infrastructure/  # Infrastructure Layer (Teknik Detaylar)
└── api/             # API Layer (HTTP Endpoints)
```

---

## 1. Domain Layer (Entity'den Başlayarak)

### Domain Entity (`src/domain/sales/entities/sale.entity.ts`)

```typescript
// Pure business logic, no framework dependencies
export class Sale {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public saleNumber: string,
    // ... diğer alanlar
  ) {
    this.validate(); // Business rules enforced here
  }

  private validate(): void {
    // Domain validation rules
    if (this.totalAmount < 0) {
      throw new Error('Total amount cannot be negative');
    }
    // ...
  }

  addItem(item: SaleItem): void {
    this.items.push(item);
    this.recalculateTotals(); // Business logic
  }
}
```

**Özellikler:**
- ✅ Framework bağımlılığı yok
- ✅ İş kuralları entity içinde
- ✅ Validation ve business logic burada
- ✅ Immutable alanlar (`readonly`)

### Repository Interface (`src/domain/sales/repositories/sale.repository.ts`)

```typescript
// Port (Interface) - Domain defines what it needs
export interface ISaleRepository {
  findById(id: string): Promise<Sale | null>;
  findByTenantId(tenantId: string): Promise<Sale[]>;
  save(sale: Sale): Promise<Sale>;
  // ...
}
```

**Özellikler:**
- ✅ Domain katmanı sadece interface tanımlar
- ✅ Implementation domain'de değil (Dependency Inversion)

---

## 2. Infrastructure Layer (Veritabanı Implementasyonu)

### TypeORM Entity (`src/infrastructure/persistence/typeorm/entities/sale.typeorm-entity.ts`)

```typescript
@Entity('sales')
export class SaleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  // Domain ↔ TypeORM mapping
  toDomain(): Sale {
    return Sale.create(
      this.id,
      this.tenantId,
      // ...
    );
  }

  static fromDomain(sale: Sale): SaleEntity {
    const entity = new SaleEntity();
    entity.id = sale.id;
    // ...
    return entity;
  }
}
```

**Özellikler:**
- ✅ TypeORM decorator'ları burada
- ✅ `toDomain()` ve `fromDomain()` ile mapping
- ✅ Domain entity'den bağımsız

### Repository Implementation (`src/infrastructure/persistence/typeorm/repositories/sale.typeorm-repo.ts`)

```typescript
@Injectable()
export class SaleRepository implements ISaleRepository {
  constructor(
    @InjectRepository(SaleEntity)
    private readonly repository: Repository<SaleEntity>,
  ) {}

  async findById(id: string): Promise<Sale | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
    return entity ? entity.toDomain() : null; // TypeORM → Domain
  }

  async save(sale: Sale): Promise<Sale> {
    const entity = SaleEntity.fromDomain(sale); // Domain → TypeORM
    const saved = await this.repository.save(entity);
    return saved.toDomain(); // TypeORM → Domain
  }
}
```

**Özellikler:**
- ✅ Domain interface'ini implement eder
- ✅ TypeORM kullanır
- ✅ Domain entity döner (TypeORM entity değil)

---

## 3. Application Layer (Use Cases)

### DTO (`src/application/sales/dto/create-sale.dto.ts`)

```typescript
export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  items: SaleItemDto[];

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;
}
```

**Özellikler:**
- ✅ Validation decorator'ları (class-validator)
- ✅ Swagger dokümantasyonu
- ✅ API kontratı

### Use Case (`src/application/sales/use-cases/create-sale.usecase.ts`)

```typescript
@Injectable()
export class CreateSaleUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('ISaleRepository')
    private readonly saleRepository: ISaleRepository,
  ) {}

  async execute(
    dto: CreateSaleDto,
    currentUser: RequestUser,
  ): Promise<SaleResponseDto> {
    // 1. Validation
    // 2. Business logic
    // 3. Domain entity oluştur
    const sale = Sale.create(/* ... */);
    
    // 4. Repository'ye kaydet
    const savedSale = await this.saleRepository.save(sale);
    
    // 5. Response DTO'ya dönüştür
    return {
      id: savedSale.id,
      // ...
    };
  }
}
```

**Özellikler:**
- ✅ Dependency Injection ile repository'ler
- ✅ İş akışı burada
- ✅ Domain entity kullanır
- ✅ Response DTO döner

---

## 4. API Layer (Controller)

### Controller (`src/api/sales/sales.controller.ts`)

```typescript
@Controller('sales')
@ApiBearerAuth()
@Roles('TenantAdmin', 'Cashier', 'Viewer') // Class-level role
export class SalesController {
  constructor(
    private readonly createSaleUseCase: CreateSaleUseCase,
  ) {}

  @Post()
  @Roles('TenantAdmin', 'Cashier') // Method-level role (overrides class)
  @ApiOperation({ summary: 'Create a new sale' })
  async create(
    @Body() createDto: CreateSaleDto,
    @CurrentUser() user: RequestUser, // JWT'den gelen user
  ): Promise<SaleResponseDto> {
    return this.createSaleUseCase.execute(createDto, user);
  }
}
```

**Özellikler:**
- ✅ HTTP endpoint tanımları
- ✅ Swagger dokümantasyonu
- ✅ Yetkilendirme decorator'ları
- ✅ Use case'i çağırır

### Module (`src/api/sales/sales.module.ts`)

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SaleEntity, // TypeORM entities
      SaleItemEntity,
    ]),
  ],
  controllers: [SalesController],
  providers: [
    CreateSaleUseCase,
    {
      provide: 'ISaleRepository', // Interface token
      useClass: SaleRepository,    // Implementation
    },
  ],
})
export class SalesModule {}
```

**Özellikler:**
- ✅ Dependency Injection yapılandırması
- ✅ Interface → Implementation mapping
- ✅ TypeORM entity'leri register eder

---

## 5. Yetkilendirme (Authentication & Authorization)

### Akış

**1. Login (`POST /auth/login`)**
```
Frontend → AuthController → LoginUseCase → UserRepository
→ JWT token oluştur → Frontend'e dön
```

**2. JWT Token Kullanımı**
```
Frontend: Authorization: Bearer <token>
↓
JwtAuthGuard (Global) → JwtStrategy.validate()
↓
Request.user = { userId, email, tenantId, roles }
```

**3. Role Kontrolü**
```
RolesGuard (Global) → @Roles() decorator kontrolü
↓
User.roles.includes(requiredRole) → true/false
```

### Guard'lar

```typescript
// app.module.ts
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard, // Tüm route'ları korur
}
{
  provide: APP_GUARD,
  useClass: RolesGuard,    // Role kontrolü yapar
}
```

### Decorator'lar

```typescript
@Public()              // JWT guard'ı bypass eder
@Roles('Admin')        // Role kontrolü
@CurrentUser()         // request.user'ı inject eder
```

### JWT Strategy (`src/infrastructure/security/jwt.strategy.ts`)

```typescript
export class JwtStrategy extends PassportStrategy(Strategy) {
  async validate(payload: JwtPayload): Promise<RequestUser> {
    return {
      userId: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      roles: payload.roles,
    };
  }
}
```

**Özellikler:**
- ✅ JWT token'ı parse eder
- ✅ `request.user`'a set eder
- ✅ Her request'te çalışır

---

## 6. Frontend → Backend Akışı

### Frontend Service (`frontend/src/services/sales.service.ts`)

```typescript
class SalesService {
  async createSale(data: CreateSaleRequest): Promise<Sale> {
    const response = await apiClient.post<Sale>('/sales', data);
    return response.data;
  }
}
```

### API Client (`frontend/src/utils/api.ts`)

```typescript
// Request interceptor - Token ekle
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - 401 durumunda logout
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/sign-in';
    }
  }
);
```

### Tam Akış

```
1. Frontend Component
   ↓
2. salesService.createSale(data)
   ↓
3. apiClient.post('/sales', data)
   ↓ (Authorization: Bearer token)
4. Backend: JwtAuthGuard → JWT validate
   ↓
5. RolesGuard → Role kontrolü
   ↓
6. SalesController.create()
   ↓
7. CreateSaleUseCase.execute()
   ↓
8. ProductRepository.findById() (stock kontrolü)
   ↓
9. Sale.create() (Domain entity)
   ↓
10. SaleRepository.save()
    ↓
11. SaleEntity.fromDomain() → TypeORM entity
    ↓
12. repository.save() → SQL INSERT
    ↓
13. SaleEntity.toDomain() → Domain entity
    ↓
14. SaleResponseDto → JSON
    ↓
15. Frontend'e response
```

---

## 7. Veritabanı Akışı

```
Domain Entity (Sale)
    ↓
TypeORM Entity (SaleEntity.fromDomain())
    ↓
TypeORM Repository.save()
    ↓
SQL Server / SQLite
    ↓
TypeORM Entity (database'den dönen)
    ↓
Domain Entity (SaleEntity.toDomain())
    ↓
Use Case → Response DTO
```

---

## 8. Yetkilendirme Detayları

### Multi-Tenant Yapı

```typescript
// Her entity'de tenantId var
export class Sale {
  public readonly tenantId: string; // Immutable
}

// Use case'de tenant kontrolü
const tenantId = currentUser.tenantId;
if (product.tenantId !== tenantId) {
  throw new ForbiddenException('Product does not belong to your tenant');
}
```

### Role Hierarchy

```
SuperAdmin     → Tüm tenant'lara erişim
TenantAdmin   → Sadece kendi tenant'ı
Cashier       → Satış yapabilir
Viewer        → Sadece görüntüleme
```

### Guard Sırası

```
1. JwtAuthGuard (Global)
   - Token var mı?
   - @Public() var mı?
   
2. RolesGuard (Global)
   - @Roles() var mı?
   - User.roles.includes(requiredRole)?
   
3. Controller method çalışır
```

---

## Özet: Entity'den Endpoint'e Akış

```
1. DOMAIN ENTITY
   Sale.create() → Business rules

2. REPOSITORY INTERFACE
   ISaleRepository → Domain contract

3. REPOSITORY IMPLEMENTATION
   SaleRepository → TypeORM implementation

4. TYPEORM ENTITY
   SaleEntity → Database mapping

5. USE CASE
   CreateSaleUseCase → Business flow

6. DTO
   CreateSaleDto → API contract

7. CONTROLLER
   SalesController → HTTP endpoint

8. MODULE
   SalesModule → DI configuration

9. GUARDS
   JwtAuthGuard + RolesGuard → Security

10. FRONTEND
    salesService → apiClient → Backend
```

---

## Mimari Avantajları

Bu mimari sayesinde:

- ✅ **Test edilebilir** (mock repository)
- ✅ **Framework'ten bağımsız** domain
- ✅ **SOLID prensipleri**
- ✅ **Clean Architecture** katmanları
- ✅ **Multi-tenant güvenlik**

---

## Dosya Yapısı Özeti

### Backend

```
src/
├── domain/
│   └── sales/
│       ├── entities/
│       │   ├── sale.entity.ts          # Domain entity (pure)
│       │   └── sale-item.entity.ts
│       └── repositories/
│           └── sale.repository.ts      # Interface (port)
│
├── infrastructure/
│   └── persistence/
│       └── typeorm/
│           ├── entities/
│           │   └── sale.typeorm-entity.ts  # TypeORM entity
│           └── repositories/
│               └── sale.typeorm-repo.ts     # Implementation (adapter)
│
├── application/
│   └── sales/
│       ├── dto/
│       │   ├── create-sale.dto.ts      # Request DTO
│       │   └── sale-response.dto.ts    # Response DTO
│       └── use-cases/
│           └── create-sale.usecase.ts  # Business flow
│
└── api/
    └── sales/
        ├── sales.controller.ts         # HTTP endpoints
        └── sales.module.ts              # DI configuration
```

### Frontend

```
frontend/src/
├── services/
│   └── sales.service.ts                # API calls
├── utils/
│   └── api.ts                          # Axios client + interceptors
└── views/
    └── admin/sales/
        └── CreateSalePage.tsx          # React component
```

---

## Önemli Notlar

1. **Domain katmanı hiçbir framework bağımlılığı içermez**
2. **Repository pattern ile veritabanı değiştirilebilir**
3. **Use case'ler domain entity kullanır, TypeORM entity değil**
4. **DTO'lar API kontratını tanımlar**
5. **Guard'lar global olarak tüm route'ları korur**
6. **Multi-tenant yapı her seviyede kontrol edilir**

---

*Son güncelleme: 2024*
