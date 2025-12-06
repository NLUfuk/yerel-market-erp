# Local Grocery Hub - Mini ERP Sistemi
## Kapsamlı Proje Planı

## 📋 PROJE ÖZETİ

**Hedef**: Multi-tenant küçük marketler için mini ERP sistemi
**Backend**: NestJS + TypeScript + TypeORM + SQL Server
**Frontend**: React + TypeScript + Chakra UI (Horizon UI template)
**Mimari**: Clean Architecture / Onion Architecture
**Prensipler**: SOLID, Clean Code, Security First

---

## 🏗️ MİMARİ YAPISI

### Backend Klasör Yapısı (Clean Architecture)

```
yerel-market-erp/
├── src/
│   ├── domain/                          # Domain Layer (Pure Business Logic)
│   │   ├── tenants/
│   │   │   ├── entities/
│   │   │   │   └── tenant.entity.ts
│   │   │   ├── repositories/
│   │   │   │   └── tenant.repository.ts      # Interface (Port)
│   │   │   └── services/
│   │   │       └── tenant.domain-service.ts   # Domain business rules
│   │   ├── users/
│   │   │   ├── entities/
│   │   │   │   ├── user.entity.ts
│   │   │   │   ├── role.entity.ts
│   │   │   │   └── user-role.entity.ts
│   │   │   └── repositories/
│   │   │       └── user.repository.ts
│   │   ├── products/
│   │   │   ├── entities/
│   │   │   │   ├── product.entity.ts
│   │   │   │   └── category.entity.ts
│   │   │   └── repositories/
│   │   │       └── product.repository.ts
│   │   └── sales/
│   │       ├── entities/
│   │       │   ├── sale.entity.ts
│   │       │   ├── sale-item.entity.ts
│   │       │   └── stock-movement.entity.ts
│   │       └── repositories/
│   │           ├── sale.repository.ts
│   │           └── stock-movement.repository.ts
│   │
│   ├── application/                      # Application Layer (Use Cases)
│   │   ├── auth/
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register-tenant.dto.ts
│   │   │   │   └── auth-response.dto.ts
│   │   │   └── use-cases/
│   │   │       ├── login.usecase.ts
│   │   │       └── register-tenant.usecase.ts
│   │   ├── tenants/
│   │   │   ├── dto/
│   │   │   │   ├── create-tenant.dto.ts
│   │   │   │   ├── update-tenant.dto.ts
│   │   │   │   └── tenant-response.dto.ts
│   │   │   └── use-cases/
│   │   │       ├── create-tenant.usecase.ts
│   │   │       ├── update-tenant.usecase.ts
│   │   │       ├── list-tenants.usecase.ts
│   │   │       └── get-tenant.usecase.ts
│   │   ├── users/
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   ├── update-user.dto.ts
│   │   │   │   └── user-response.dto.ts
│   │   │   └── use-cases/
│   │   │       ├── create-user.usecase.ts
│   │   │       ├── update-user.usecase.ts
│   │   │       ├── list-users.usecase.ts
│   │   │       └── assign-role.usecase.ts
│   │   ├── products/
│   │   │   ├── dto/
│   │   │   │   ├── create-product.dto.ts
│   │   │   │   ├── update-product.dto.ts
│   │   │   │   ├── create-category.dto.ts
│   │   │   │   └── product-response.dto.ts
│   │   │   └── use-cases/
│   │   │       ├── create-product.usecase.ts
│   │   │       ├── update-product.usecase.ts
│   │   │       ├── list-products.usecase.ts
│   │   │       ├── create-category.usecase.ts
│   │   │       └── list-categories.usecase.ts
│   │   ├── sales/
│   │   │   ├── dto/
│   │   │   │   ├── create-sale.dto.ts
│   │   │   │   ├── sale-response.dto.ts
│   │   │   │   └── sales-report.dto.ts
│   │   │   └── use-cases/
│   │   │       ├── create-sale.usecase.ts
│   │   │       ├── list-sales.usecase.ts
│   │   │       └── get-sales-report.usecase.ts
│   │   ├── stock/
│   │   │   ├── dto/
│   │   │   │   └── stock-movement.dto.ts
│   │   │   └── use-cases/
│   │   │       ├── create-stock-movement.usecase.ts
│   │   │       └── adjust-stock.usecase.ts
│   │   ├── reports/
│   │   │   ├── dto/
│   │   │   │   ├── sales-summary.dto.ts
│   │   │   │   └── top-products.dto.ts
│   │   │   └── use-cases/
│   │   │       ├── get-sales-summary.usecase.ts
│   │   │       └── get-top-products.usecase.ts
│   │
│   ├── infrastructure/                  # Infrastructure Layer
│   │   ├── persistence/
│   │   │   └── typeorm/
│   │   │       ├── entities/            # TypeORM entity decorators
│   │   │       │   ├── tenant.typeorm-entity.ts
│   │   │       │   ├── user.typeorm-entity.ts
│   │   │       │   ├── product.typeorm-entity.ts
│   │   │       │   └── sale.typeorm-entity.ts
│   │   │       ├── repositories/        # Repository implementations
│   │   │       │   ├── tenant.typeorm-repo.ts
│   │   │       │   ├── user.typeorm-repo.ts
│   │   │       │   ├── product.typeorm-repo.ts
│   │   │       │   └── sale.typeorm-repo.ts
│   │   │       ├── migrations/
│   │   │       │   └── [timestamp]-initial-schema.ts
│   │   │       └── database.module.ts
│   │   ├── security/
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   ├── tenant.guard.ts
│   │   │   └── decorators/
│   │   │       ├── roles.decorator.ts
│   │   │       └── current-user.decorator.ts
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   ├── auth.config.ts
│   │   │   └── app.config.ts
│   │   └── exceptions/
│   │       ├── http-exception.filter.ts
│   │       └── validation.pipe.ts
│   │
│   ├── api/                             # API Layer (Controllers)
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   └── auth.controller.ts
│   │   ├── tenants/
│   │   │   ├── tenants.module.ts
│   │   │   └── tenants.controller.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   └── users.controller.ts
│   │   ├── products/
│   │   │   ├── products.module.ts
│   │   │   └── products.controller.ts
│   │   ├── sales/
│   │   │   ├── sales.module.ts
│   │   │   └── sales.controller.ts
│   │   ├── stock/
│   │   │   ├── stock.module.ts
│   │   │   └── stock.controller.ts
│   │   └── reports/
│   │       ├── reports.module.ts
│   │       └── reports.controller.ts
│   │
│   └── main.ts
│
├── test/
│   ├── unit/
│   │   └── application/
│   ├── integration/
│   │   └── api/
│   └── e2e/
│
├── .env.example
├── .env
├── nest-cli.json
├── tsconfig.json
├── package.json
└── README.md
```

### Frontend Klasör Yapısı (TypeScript Migration)

```
horizon-ui-chakra-main/
├── src/
│   ├── api/                             # API Client Layer
│   │   ├── httpClient.ts                # Axios instance + interceptors
│   │   ├── authApi.ts
│   │   ├── tenantsApi.ts
│   │   ├── usersApi.ts
│   │   ├── productsApi.ts
│   │   ├── salesApi.ts
│   │   ├── stockApi.ts
│   │   └── reportsApi.ts
│   │
│   ├── types/                           # TypeScript Type Definitions
│   │   ├── api.types.ts                 # API response types
│   │   ├── auth.types.ts
│   │   ├── entities.types.ts           # Domain entity types
│   │   └── index.ts
│   │
│   ├── context/                         # React Context
│   │   └── AuthContext.tsx              # Auth state management
│   │
│   ├── hooks/                           # Custom Hooks
│   │   ├── useAuth.ts
│   │   ├── useTenant.ts
│   │   └── useRole.ts
│   │
│   ├── utils/                           # Utility Functions
│   │   ├── formatters.ts               # Date, currency formatters
│   │   ├── validators.ts               # Form validations
│   │   └── constants.ts               # App constants
│   │
│   ├── components/                      # [MEVCUT - TypeScript'e çevrilecek]
│   │   ├── card/                       # Horizon UI card components
│   │   ├── sidebar/                     # Horizon UI sidebar
│   │   ├── navbar/                      # Horizon UI navbar
│   │   └── ...
│   │
│   ├── components/local-grocery/        # [YENİ - ERP Reusable Components]
│   │   ├── Pagination.tsx
│   │   ├── SearchInput.tsx
│   │   ├── DataTable.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   ├── EmptyState.tsx
│   │   └── SaleSummaryCard.tsx
│   │
│   ├── layouts/                         # [MEVCUT - TypeScript'e çevrilecek]
│   │   ├── admin/
│   │   └── auth/
│   │
│   ├── views/
│   │   ├── admin/
│   │   │   ├── default/                # [MEVCUT]
│   │   │   ├── dataTables/            # [MEVCUT]
│   │   │   ├── profile/               # [MEVCUT]
│   │   │   └── local-grocery/        # [YENİ - ERP Sayfaları]
│   │   │       ├── DashboardPage.tsx
│   │   │       ├── ProductsListPage.tsx
│   │   │       ├── ProductFormPage.tsx
│   │   │       ├── CategoriesPage.tsx
│   │   │       ├── NewSalePage.tsx
│   │   │       ├── SalesHistoryPage.tsx
│   │   │       ├── SalesReportPage.tsx
│   │   │       ├── TopProductsPage.tsx
│   │   │       ├── StockManagementPage.tsx
│   │   │       ├── TenantManagementPage.tsx    # SuperAdmin
│   │   │       └── UsersManagementPage.tsx     # TenantAdmin
│   │   └── auth/
│   │       └── signIn/                 # [MEVCUT - TypeScript'e çevrilecek]
│   │
│   ├── routes/
│   │   └── appRoutes.tsx               # Route definitions + role-based
│   │
│   ├── theme/                          # [MEVCUT]
│   ├── variables/                     # [MEVCUT]
│   ├── App.tsx                        # [TypeScript'e çevrilecek]
│   └── index.tsx
│
├── tsconfig.json                       # [YENİ]
├── package.json                        # [TypeScript dependencies eklenecek]
└── README.md
```

---

## 🎨 UI TASARIM DETAYLARI

### Design System (Chakra UI + Horizon UI)

#### Temel Component'ler
- **Layout**: Horizon UI Admin Layout (Sidebar + Navbar + Footer)
- **Cards**: Chakra UI Card component'i (MiniStatistics, ComplexTable için)
- **Tables**: Chakra UI Table + @tanstack/react-table (sorting, pagination)
- **Forms**: Chakra UI FormControl + react-hook-form
- **Buttons**: Chakra UI Button (variants: solid, outline, ghost)
- **Inputs**: Chakra UI Input, Select, NumberInput, Textarea
- **Modals**: Chakra UI Modal (confirmations, forms)
- **Toast**: Chakra UI useToast (success, error, warning notifications)
- **Loading**: Chakra UI Spinner + Skeleton (loading states)
- **Icons**: react-icons (Md*, Fa*)

### Sayfa Tasarımları

#### 1. Dashboard Page (`/admin/local-grocery/dashboard`)
**Layout:**
```
┌─────────────────────────────────────────┐
│  Header Stats (4 cards)                │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │Sales │ │Orders│ │Stock │ │Users │   │
│  │Today │ │Today │ │Low   │ │Total │   │
│  └──────┘ └──────┘ └──────┘ └──────┘   │
├─────────────────────────────────────────┤
│  Charts Section (2 columns)              │
│  ┌──────────────────┐ ┌──────────────┐│
│  │ Sales Chart      │ │ Top Products  ││
│  │ (Line Chart)     │ │ (Bar Chart)   ││
│  └──────────────────┘ └──────────────┘│
├─────────────────────────────────────────┤
│  Recent Sales Table                      │
│  ┌─────────────────────────────────────┐│
│  │ Sale# | Date | Amount | Cashier    ││
│  │ ...                                  ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**Component'ler:**
- `MiniStatistics` (4 adet): Today's Sales, Today's Orders, Low Stock Items, Total Users
- `CardLineChart`: Last 7 days sales trend
- `CardBarChart`: Top 5 products by sales
- `ComplexTable`: Recent 10 sales (columns: Sale#, Date, Amount, Cashier, Actions)

#### 2. Products List Page (`/admin/local-grocery/products`)
**Layout:**
```
┌─────────────────────────────────────────┐
│  Page Header                             │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │ Products     │  │ [+ New Product] │ │
│  └──────────────┘  └──────────────────┘ │
├─────────────────────────────────────────┤
│  Filters & Search                        │
│  ┌────────┐ ┌────────┐ ┌──────────────┐ │
│  │Search  │ │Category│ │[Filter]      │ │
│  └────────┘ └────────┘ └──────────────┘ │
├─────────────────────────────────────────┤
│  Products Table                          │
│  ┌─────────────────────────────────────┐│
│  │ Name | SKU | Category | Stock | ... ││
│  │ [Edit] [Delete] [View]              ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  Pagination                              │
│  ┌─────────────────────────────────────┐│
│  │ < 1 2 3 ... 10 >                     ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**Component'ler:**
- `CardTable`: Products table (columns: Name, SKU, Barcode, Category, Stock, Price, Status, Actions)
- Search input (real-time filtering)
- Category filter dropdown
- Pagination component (reusable)
- Empty state: "No products found"
- Loading state: Skeleton rows

#### 3. Product Form Page (`/admin/local-grocery/products/new` veya `/edit/:id`)
**Layout:**
```
┌─────────────────────────────────────────┐
│  Page Header                             │
│  ┌──────────────┐                        │
│  │ New Product │                        │
│  └──────────────┘                        │
├─────────────────────────────────────────┤
│  Form (2 columns)                        │
│  ┌──────────────┐ ┌──────────────┐     │
│  │ Basic Info   │ │ Pricing      │     │
│  │ Name*        │ │ Unit Price*  │     │
│  │ SKU*         │ │ Cost Price   │     │
│  │ Barcode      │ │              │     │
│  │ Category*    │ │ Stock Info   │     │
│  │              │ │ Stock Qty*   │     │
│  │              │ │ Min Level    │     │
│  └──────────────┘ └──────────────┘     │
├─────────────────────────────────────────┤
│  Actions                                 │
│  ┌──────────┐ ┌──────────┐             │
│  │ [Cancel] │ │ [Save]    │             │
│  └──────────┘ └──────────┘             │
└─────────────────────────────────────────┘
```

**Component'ler:**
- Chakra UI FormControl + Input fields
- Validation: react-hook-form + yup/zod
- Error messages: FormErrorMessage
- Success toast on save

#### 4. New Sale Page (`/admin/local-grocery/sales/new`)
**Layout:**
```
┌─────────────────────────────────────────┐
│  Page Header                             │
│  ┌──────────────┐                        │
│  │ New Sale     │                        │
│  └──────────────┘                        │
├─────────────────────────────────────────┤
│  Product Search & Add                    │
│  ┌─────────────────────────────────────┐│
│  │ [Search by name/SKU/barcode...]    ││
│  │ [Add Product]                       ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  Sale Items Table                        │
│  ┌─────────────────────────────────────┐│
│  │ Product | Qty | Price | Total | [X] ││
│  │ ...                                  ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  Summary (Right Sidebar)                 │
│  ┌─────────────────────────────────────┐│
│  │ Subtotal:      ₺XXX.XX               ││
│  │ Discount:      [Input]              ││
│  │ ─────────────────────────            ││
│  │ Total:         ₺XXX.XX              ││
│  │ Payment:       [Cash/Card/Mixed]    ││
│  │ [Complete Sale]                     ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**Component'ler:**
- Product search autocomplete
- Sale items table (editable quantities, remove items)
- Summary card (calculations)
- Payment method selector
- Real-time total calculation

#### 5. Sales History Page (`/admin/local-grocery/sales/history`)
**Layout:**
```
┌─────────────────────────────────────────┐
│  Page Header                             │
│  ┌──────────────┐                        │
│  │ Sales History│                        │
│  └──────────────┘                        │
├─────────────────────────────────────────┤
│  Filters                                 │
│  ┌────────┐ ┌────────┐ ┌──────────────┐ │
│  │DateFrom│ │DateTo  │ │[Apply Filter]│ │
│  └────────┘ └────────┘ └──────────────┘ │
├─────────────────────────────────────────┤
│  Sales Table                             │
│  ┌─────────────────────────────────────┐│
│  │ Sale# | Date | Amount | Cashier |...││
│  │ [View Details]                      ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  Pagination                              │
└─────────────────────────────────────────┘
```

**Component'ler:**
- Date range picker
- Sales table with expandable rows (sale items)
- View details modal
- Export button (future)

#### 6. Reports Pages
**Sales Report Page:**
- Date range selector
- Summary cards (Total Sales, Avg Daily, Growth %)
- Chart (sales over time)
- Table (daily breakdown)

**Top Products Page:**
- Period selector (Today, Week, Month)
- Bar chart (top 10 products)
- Table (product details)

### Reusable Component'ler

#### 1. Pagination Component
```typescript
<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={handlePageChange}
/>
```

#### 2. Search Input
```typescript
<SearchInput
  placeholder="Search products..."
  onSearch={handleSearch}
  debounceMs={300}
/>
```

#### 3. Data Table (Generic)
```typescript
<DataTable
  columns={columns}
  data={data}
  loading={isLoading}
  emptyMessage="No data found"
  onRowClick={handleRowClick}
/>
```

#### 4. Confirm Modal
```typescript
<ConfirmModal
  isOpen={isOpen}
  title="Delete Product?"
  message="Are you sure you want to delete this product?"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

#### 5. Loading Skeleton
```typescript
<TableSkeleton rows={5} columns={6} />
<CardSkeleton />
```

### State Management

#### Loading States
- **Table loading**: Skeleton rows
- **Form loading**: Disabled inputs + spinner
- **Button loading**: Loading spinner + disabled state
- **Page loading**: Full page skeleton

#### Error States
- **API errors**: Toast notification (error variant)
- **Form errors**: Inline error messages (FormErrorMessage)
- **Empty states**: Empty state component with icon + message
- **404 errors**: Not found page

#### Success States
- **Form submit**: Success toast + redirect
- **Delete**: Success toast + refresh list
- **Update**: Success toast + update UI

### Responsive Design

#### Breakpoints (Chakra UI default)
- **Mobile**: < 768px (single column, stacked layout)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (full layout)

#### Mobile Adaptations
- Sidebar: Drawer (collapsed by default)
- Tables: Horizontal scroll veya card view
- Forms: Single column
- Dashboard: Stacked cards

### Color Scheme (Horizon UI Theme)
- **Primary**: Brand color (blue)
- **Success**: Green
- **Error**: Red
- **Warning**: Orange
- **Info**: Blue
- **Background**: Light/Dark mode support

### Typography
- **Headings**: Horizon UI heading styles
- **Body**: Chakra UI Text component
- **Labels**: FormLabel component
- **Code**: Monospace font for SKU, barcode

### Spacing & Layout
- **Container padding**: 20px (mobile), 30px (desktop)
- **Card spacing**: 20px margin
- **Form spacing**: 24px between fields
- **Table spacing**: 16px row height

### Accessibility
- **Keyboard navigation**: Tab order, Enter to submit
- **ARIA labels**: Screen reader support
- **Focus states**: Visible focus indicators
- **Color contrast**: WCAG AA compliant

### Animation & Transitions
- **Page transitions**: Fade in (200ms)
- **Modal**: Slide + fade (300ms)
- **Toast**: Slide in from top (300ms)
- **Loading**: Skeleton pulse animation

---

## 📊 DOMAIN MODEL (Detaylı)

### Entity İlişkileri

```
Tenant (1) ──< (N) User
Tenant (1) ──< (N) Product
Tenant (1) ──< (N) Category
Tenant (1) ──< (N) Sale

User (N) ──< (N) Role (Many-to-Many via UserRole)
User (1) ──< (N) Sale (cashierId)

Category (1) ──< (N) Product
Product (1) ──< (N) SaleItem
Product (1) ──< (N) StockMovement

Sale (1) ──< (N) SaleItem
Sale (1) ──< (N) StockMovement (referenceId)
```

### Entity Detayları

#### Tenant
```typescript
- id: UUID (PK)
- name: string (unique, required)
- address: string (optional)
- phone: string (optional)
- email: string (optional)
- isActive: boolean (default: true)
- createdAt: Date
- updatedAt: Date
```

#### Role
```typescript
- id: UUID (PK)
- name: enum ['SuperAdmin', 'TenantAdmin', 'Cashier', 'Viewer']
- description: string (optional)
- createdAt: Date
```

#### User
```typescript
- id: UUID (PK)
- email: string (unique per tenant, required)
- passwordHash: string (required, bcrypt)
- firstName: string (required)
- lastName: string (required)
- tenantId: UUID (FK → Tenant, nullable for SuperAdmin)
- isActive: boolean (default: true)
- createdAt: Date
- updatedAt: Date
- Relations: UserRole[] (ManyToMany)
```

#### UserRole
```typescript
- userId: UUID (FK → User, PK)
- roleId: UUID (FK → Role, PK)
- assignedAt: Date
- assignedBy: UUID (FK → User)
- Composite Primary Key: (userId, roleId)
```

#### Category
```typescript
- id: UUID (PK)
- name: string (required, unique per tenant)
- description: string (optional)
- tenantId: UUID (FK → Tenant, required)
- createdAt: Date
- updatedAt: Date
```

#### Product
```typescript
- id: UUID (PK)
- name: string (required)
- sku: string (unique per tenant, required)
- barcode: string (optional, unique per tenant)
- categoryId: UUID (FK → Category, required)
- tenantId: UUID (FK → Tenant, required)
- unitPrice: decimal(18,2) (required, >= 0)
- costPrice: decimal(18,2) (optional, >= 0)
- stockQuantity: decimal(18,2) (default: 0, >= 0)
- minStockLevel: decimal(18,2) (optional, default: 0)
- isActive: boolean (default: true)
- createdAt: Date
- updatedAt: Date
```

#### StockMovement
```typescript
- id: UUID (PK)
- productId: UUID (FK → Product, required)
- tenantId: UUID (FK → Tenant, required)
- movementType: enum ['PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN']
- quantity: decimal(18,2) (required, != 0)
- unitPrice: decimal(18,2) (required, >= 0)
- referenceId: UUID (optional, Sale.id veya Purchase.id)
- notes: string (optional)
- createdBy: UUID (FK → User, required)
- createdAt: Date
```

#### Sale
```typescript
- id: UUID (PK)
- tenantId: UUID (FK → Tenant, required)
- saleNumber: string (unique per tenant, auto-generated)
- totalAmount: decimal(18,2) (required, >= 0)
- discountAmount: decimal(18,2) (default: 0, >= 0)
- finalAmount: decimal(18,2) (required, = totalAmount - discountAmount)
- paymentMethod: enum ['CASH', 'CARD', 'MIXED']
- cashierId: UUID (FK → User, required)
- createdAt: Date
- Relations: SaleItem[] (OneToMany)
```

#### SaleItem
```typescript
- id: UUID (PK)
- saleId: UUID (FK → Sale, required)
- productId: UUID (FK → Product, required)
- quantity: decimal(18,2) (required, > 0)
- unitPrice: decimal(18,2) (required, >= 0)
- discountAmount: decimal(18,2) (default: 0, >= 0)
- lineTotal: decimal(18,2) (required, = (quantity * unitPrice) - discountAmount)
```

---

## 🔐 MULTI-TENANT GÜVENLİK KURALLARI

### JWT Payload Yapısı
```typescript
{
  sub: string;        // userId (UUID)
  email: string;
  tenantId: string | null;  // null for SuperAdmin
  roles: string[];    // ['SuperAdmin'] veya ['TenantAdmin', 'Cashier']
  iat: number;
  exp: number;
}
```

### TenantId Extract Mekanizması
1. JWT'den otomatik extract edilir (`JwtStrategy`)
2. Request object'e `req.user.tenantId` olarak eklenir
3. SuperAdmin'in `tenantId`'si `null` olabilir (tüm tenant'lara erişim)

### Guard Hiyerarşisi
1. **JwtAuthGuard**: JWT token kontrolü
2. **TenantGuard**: TenantId kontrolü (SuperAdmin bypass)
3. **RolesGuard**: Role bazlı endpoint koruması

### Role-Based Access Control

| Role | Tenant Management | User Management | Products | Sales | Reports |
|------|------------------|-----------------|----------|-------|---------|
| SuperAdmin | ✅ All | ✅ All Tenants | ❌ | ❌ | ✅ All |
| TenantAdmin | ❌ | ✅ Own Tenant | ✅ Own Tenant | ✅ Own Tenant | ✅ Own Tenant |
| Cashier | ❌ | ❌ | ❌ (View) | ✅ Own Tenant | ✅ Own Tenant |
| Viewer | ❌ | ❌ | ❌ (View) | ❌ | ✅ Own Tenant |

---

## 🗄️ DATABASE SCHEMA

### SQL Server Konfigürasyonu
- Database: `LocalGroceryHub` (SSMS'te manuel oluşturulacak)
- Connection String: `.env` dosyasından okunacak
- Migrations: TypeORM migrations kullanılacak
- Naming: snake_case (TypeORM default)

### Index'ler
- `users.email` + `users.tenantId` (unique composite)
- `products.sku` + `products.tenantId` (unique composite)
- `products.barcode` + `products.tenantId` (unique composite, nullable)
- `sales.saleNumber` + `sales.tenantId` (unique composite)
- `stock_movements.productId` + `stock_movements.createdAt` (performance)

---

## 📝 ENVIRONMENT VARIABLES

### .env.example
```env
# Database
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourPassword123
DB_DATABASE=LocalGroceryHub
DB_SYNCHRONIZE=false
DB_LOGGING=false

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

---

## 🧪 TEST STRATEJİSİ

### Unit Tests
- **Hedef**: Use case'ler, domain service'ler
- **Framework**: Jest
- **Mock**: Repository interface'leri
- **Coverage**: %70+ (business logic)

### Integration Tests
- **Hedef**: API endpoint'leri
- **Framework**: Supertest + Jest
- **Database**: Test database (her test sonrası cleanup)
- **Coverage**: Critical flows

### E2E Tests (Optional)
- **Hedef**: Critical user flows
- **Framework**: Jest + Puppeteer (veya Playwright)
- **Kapsam**: Login, Sale creation, Multi-tenant isolation

---

## 📦 DEPENDENCIES

### Backend (NestJS)
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "typeorm": "^0.3.17",
    "mssql": "^10.0.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "bcrypt": "^5.1.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@types/node": "^20.0.0",
    "@types/bcrypt": "^5.0.2",
    "@types/passport-jwt": "^3.0.13",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.1",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "supertest": "^6.3.3",
    "@types/supertest": "^2.0.16"
  }
}
```

### Frontend (React + TypeScript)
```json
{
  "dependencies": {
    "@chakra-ui/react": "^2.6.1",
    "@chakra-ui/icons": "^2.0.19",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.25.1",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "react-query": "^3.39.3",
    "@tanstack/react-table": "^8.19.3",
    "yup": "^1.3.0",
    "@hookform/resolvers": "^3.3.0",
    "react-icons": "^5.2.1",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
```

---

## 🚀 IMPLEMENTATION PLAN

### PHASE 1: Backend Setup (2-3 saat)
1. ✅ NestJS proje kurulumu
2. ✅ TypeORM + SQL Server konfigürasyonu
3. ✅ Domain entity'leri tanımla
4. ✅ Repository interface'leri tanımla
5. ✅ Database migration'ları oluştur
6. ✅ CORS configuration (main.ts)
7. ✅ Database seeding (default roles + first SuperAdmin)

### PHASE 2: Backend Auth & Security (2-3 saat)
8. ✅ JWT strategy + guards
9. ✅ TenantGuard + RolesGuard
10. ✅ Auth use case'leri (login, register-tenant)
11. ✅ Auth controller + endpoints
12. ✅ Global exception filter (standardize error responses)

### PHASE 3: Backend Core Modules (4-5 saat)
13. ✅ Shared DTO'lar (PaginationDto, BaseResponseDto)
14. ✅ Tenant management (use cases + controller + pagination)
15. ✅ User management (use cases + controller + pagination)
16. ✅ Product & Category (use cases + controller + pagination + search)
17. ✅ Stock management (use cases + controller)

### PHASE 4: Backend Sales & Reports (3-4 saat)
18. ✅ Sale creation (use case + controller)
19. ✅ Sales history (use case + controller + pagination + filters)
20. ✅ Reports (sales summary, top products)

### PHASE 5: Backend Swagger & Testing (1-2 saat)
21. ✅ Swagger konfigürasyonu
22. ✅ Tüm endpoint'ler için Swagger decorators
23. ✅ Örnek unit test (1 use case)
24. ✅ Örnek integration test (1 endpoint)

### PHASE 6: Frontend TypeScript Migration (3-4 saat)
25. ✅ tsconfig.json ekle
26. ✅ TypeScript dependencies ekle
27. ✅ Mevcut component'leri TypeScript'e çevir
28. ✅ Type definitions oluştur

### PHASE 7: Frontend API Layer (1-2 saat)
29. ✅ Axios httpClient setup
30. ✅ API client'ları (authApi, productsApi, vb.)
31. ✅ Interceptors (JWT token, error handling)
32. ✅ Pagination utilities (hooks, types)

### PHASE 8: Frontend Auth & Context (2-3 saat)
33. ✅ AuthContext implementation
34. ✅ useAuth hook
35. ✅ Login page (TypeScript)
36. ✅ Protected route wrapper

### PHASE 9: Frontend ERP Pages (6-8 saat)
37. ✅ Reusable components (Pagination, SearchInput, DataTable, ConfirmModal, LoadingSkeleton)
38. ✅ Dashboard page (stats cards + charts + recent sales table)
39. ✅ Products list page (table + search + filters + pagination)
40. ✅ Product form page (create/edit with validation)
41. ✅ Categories page (list + form)
42. ✅ New Sale page (product search + items table + summary + payment)
43. ✅ Sales history page (table + date filters + pagination + details modal)
44. ✅ Reports pages (sales summary + top products with charts)
45. ✅ Tenant/User management pages (role-based + pagination + forms)

### PHASE 10: Frontend Integration & Polish (3-4 saat)
46. ✅ Route entegrasyonu (routes.tsx)
47. ✅ Role-based menu (sidebar - dynamic menu items)
48. ✅ Error handling + toast notifications (global error handler)
49. ✅ Loading states (skeleton loaders for all pages)
50. ✅ Form validations (react-hook-form + yup/zod)
51. ✅ Empty states (no data components)
52. ✅ Responsive design (mobile adaptations)
53. ✅ Accessibility (keyboard navigation, ARIA labels)

### PHASE 11: Testing & Documentation (2-3 saat)
50. ✅ Backend integration test'leri
51. ✅ Frontend component test'leri
52. ✅ README.md güncellemesi
53. ✅ API documentation (Swagger)

**TOPLAM TAHMİNİ SÜRE: 30-42 saat** (UI tasarım detayları + reusable components eklendi)

---

## ⚠️ EKSİKLER VE ÖNERİLER

### 🔴 Kritik Eksikler (MVP için gerekli)

1. **Pagination & Filtering**
   - List endpoint'lerinde pagination yok
   - Search/filter özellikleri eksik
   - **Öneri**: `list-products`, `list-sales`, `list-users` için pagination DTO'ları ekle
   - Query parameters: `page`, `limit`, `search`, `sortBy`, `sortOrder`

2. **Audit Fields**
   - Entity'lerde `createdBy`, `updatedBy` alanları yok
   - Kim ne zaman ne yaptı takibi eksik
   - **Öneri**: Base entity'ye audit fields ekle (opsiyonel ama önerilir)

3. **Database Seeding**
   - Default roles (SuperAdmin, TenantAdmin, vb.) seed data yok
   - **Öneri**: Migration veya seed script ile default roles oluştur

4. **CORS Configuration**
   - Frontend-backend arası CORS ayarları belirtilmemiş
   - **Öneri**: `main.ts`'de CORS middleware ekle

5. **Global Exception Filter**
   - Error handling var ama detayları eksik
   - **Öneri**: Standardize error response formatı tanımla

### 🟡 Önemli Eksikler (İleride eklenebilir)

6. **Soft Delete**
   - Silinen kayıtlar için soft delete stratejisi yok
   - **Öneri**: `deletedAt` field ekle (opsiyonel)

7. **File Upload**
   - Ürün resimleri için dosya yükleme yok
   - **Öneri**: Multer ile file upload endpoint'i ekle (opsiyonel)

8. **Password Reset**
   - Şifre sıfırlama özelliği yok
   - **Öneri**: Email ile password reset flow ekle (opsiyonel)

9. **Export Functionality**
   - Raporları PDF/Excel olarak export etme yok
   - **Öneri**: PDF/Excel export library'leri ekle (opsiyonel)

10. **Bulk Operations**
    - Toplu ürün ekleme/düzenleme yok
    - **Öneri**: Bulk import endpoint'leri ekle (opsiyonel)

11. **Notifications**
    - Low stock alerts gibi bildirimler yok
    - **Öneri**: WebSocket veya polling ile notification sistemi (opsiyonel)

12. **Logging Strategy**
    - Detaylı logging stratejisi belirtilmemiş
    - **Öneri**: Winston veya Pino logger ekle (opsiyonel)

### ✅ Planın Güçlü Yönleri

- ✅ Clean Architecture yapısı net
- ✅ Domain model detaylı
- ✅ Multi-tenant güvenlik kuralları açık
- ✅ Role-based access control tanımlı
- ✅ Test stratejisi var
- ✅ TypeScript migration planı var
- ✅ Adım adım implementation planı mevcut

---

## 📝 PLAN GÜNCELLEME ÖNERİLERİ

### MVP için Minimum Eklemeler:

1. **Pagination DTO'ları ekle** (PHASE 3'e ekle)
   ```typescript
   // application/shared/dto/pagination.dto.ts
   export class PaginationDto {
     page?: number = 1;
     limit?: number = 10;
     search?: string;
     sortBy?: string;
     sortOrder?: 'ASC' | 'DESC' = 'ASC';
   }
   ```

2. **Database Seeding** (PHASE 1'e ekle)
   - Default roles seed script'i
   - İlk SuperAdmin kullanıcısı oluşturma

3. **CORS Configuration** (PHASE 1'e ekle)
   - `main.ts`'de CORS middleware

4. **Global Exception Filter** (PHASE 2'ye ekle)
   - Standardize error response formatı

### İleride Eklenebilecekler (Opsiyonel):

- Soft delete
- File upload (product images)
- Password reset
- Export (PDF/Excel)
- Bulk operations
- Notifications
- Advanced logging

**Öneri**: MVP için mevcut plan yeterli. Yukarıdaki kritik eklemeleri (pagination, seeding, CORS) yapalım, diğerleri sonra eklenebilir.

---

## ✅ CHECKLIST - BAŞLAMADAN ÖNCE

- [ ] SQL Server kurulu ve çalışıyor mu?
- [ ] Database `LocalGroceryHub` oluşturuldu mu?
- [ ] Node.js LTS versiyonu kurulu mu?
- [ ] Backend workspace hazır mı? (`yerel-market-erp`)
- [ ] Frontend template hazır mı? (`horizon-ui-chakra-main`)
- [ ] Git repository initialize edildi mi?

---

## 🎯 SONRAKI ADIMLAR

1. Bu planı gözden geçir
2. Onay ver
3. PHASE 1'den başla (Backend Setup)
4. Her phase sonrası test et
5. Sorun varsa durdur, çöz, devam et

---

**Plan Tarihi**: 2024
**Versiyon**: 1.0
**Durum**: Hazır - Onay Bekliyor

