import { DataSource } from 'typeorm';
import { TenantEntity } from '../entities/tenant.typeorm-entity';
import { UserEntity } from '../entities/user.typeorm-entity';
import { UserRoleEntity } from '../entities/user-role.typeorm-entity';
import { CategoryEntity } from '../entities/category.typeorm-entity';
import { ProductEntity } from '../entities/product.typeorm-entity';
import { SaleEntity } from '../entities/sale.typeorm-entity';
import { SaleItemEntity } from '../entities/sale-item.typeorm-entity';
import { StockMovementEntity } from '../entities/stock-movement.typeorm-entity';
import { RoleName } from '../../../../domain/users/entities/role.entity';
import { RoleEntity } from '../entities/role.typeorm-entity';
import { StockMovementType } from '../../../../domain/sales/entities/stock-movement.entity';
import { PaymentMethod } from '../../../../domain/sales/entities/sale.entity';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

/**
 * Seed demo tenants with users, categories, and products
 */
export async function seedDemoData(dataSource: DataSource): Promise<void> {
  const tenantRepository = dataSource.getRepository(TenantEntity);
  const userRepository = dataSource.getRepository(UserEntity);
  const roleRepository = dataSource.getRepository(RoleEntity);
  const userRoleRepository = dataSource.getRepository(UserRoleEntity);
  const categoryRepository = dataSource.getRepository(CategoryEntity);
  const productRepository = dataSource.getRepository(ProductEntity);
  const saleRepository = dataSource.getRepository(SaleEntity);
  const saleItemRepository = dataSource.getRepository(SaleItemEntity);
  const stockMovementRepository = dataSource.getRepository(StockMovementEntity);

  // Get roles
  const tenantAdminRole = await roleRepository.findOneBy({ name: RoleName.TENANT_ADMIN });
  const cashierRole = await roleRepository.findOneBy({ name: RoleName.CASHIER });
  const viewerRole = await roleRepository.findOneBy({ name: RoleName.VIEWER });

  if (!tenantAdminRole || !cashierRole || !viewerRole) {
    throw new Error('Required roles not found. Please run seedDefaultRoles first.');
  }

  const passwordHash = await bcrypt.hash('Demo123!', 10);

  // Demo Tenant 1: "Bakkal Ahmet"
  const tenant1Id = randomUUID();
  await dataSource.query(
    `INSERT INTO "tenants"("id", "name", "address", "phone", "email", "isActive", "createdAt", "updatedAt") VALUES (@0, @1, @2, @3, @4, @5, GETDATE(), GETDATE())`,
    [tenant1Id, 'Bakkal Ahmet', 'Kadıköy, İstanbul', '+90 555 123 4567', 'ahmet@bakkal.com', 1]
  );
  console.log(`✅ Created tenant: Bakkal Ahmet`);

  // Tenant 1 Users
  const tenant1AdminId = randomUUID();
  await dataSource.query(
    `INSERT INTO "users"("id", "email", "passwordHash", "firstName", "lastName", "tenantId", "isActive", "createdAt", "updatedAt") VALUES (@0, @1, @2, @3, @4, @5, @6, GETDATE(), GETDATE())`,
    [tenant1AdminId, 'admin@bakkal-ahmet.com', passwordHash, 'Ahmet', 'Yılmaz', tenant1Id, 1]
  );
  await dataSource.query(
    `INSERT INTO "user_roles"("userId", "roleId", "assignedBy", "assignedAt") VALUES (@0, @1, @2, GETDATE())`,
    [tenant1AdminId, tenantAdminRole.id, tenant1AdminId]
  );
  console.log(`  ✅ Created admin user: admin@bakkal-ahmet.com`);

  const tenant1CashierId = randomUUID();
  await dataSource.query(
    `INSERT INTO "users"("id", "email", "passwordHash", "firstName", "lastName", "tenantId", "isActive", "createdAt", "updatedAt") VALUES (@0, @1, @2, @3, @4, @5, @6, GETDATE(), GETDATE())`,
    [tenant1CashierId, 'kasiyer@bakkal-ahmet.com', passwordHash, 'Mehmet', 'Demir', tenant1Id, 1]
  );
  await dataSource.query(
    `INSERT INTO "user_roles"("userId", "roleId", "assignedBy", "assignedAt") VALUES (@0, @1, @2, GETDATE())`,
    [tenant1CashierId, cashierRole.id, tenant1AdminId]
  );
  console.log(`  ✅ Created cashier user: kasiyer@bakkal-ahmet.com`);

  // Tenant 1 Categories
  const categories1 = [
    { name: 'İçecekler', description: 'Su, meyve suyu, gazlı içecekler' },
    { name: 'Atıştırmalık', description: 'Çikolata, bisküvi, cips' },
    { name: 'Temel Gıda', description: 'Ekmek, makarna, pirinç' },
    { name: 'Süt Ürünleri', description: 'Süt, peynir, yoğurt' },
  ];

  const savedCategories1: { id: string; name: string }[] = [];
  for (const catData of categories1) {
    const categoryId = randomUUID();
    await dataSource.query(
      `INSERT INTO "categories"("id", "name", "description", "tenantId", "createdAt", "updatedAt") VALUES (@0, @1, @2, @3, GETDATE(), GETDATE())`,
      [categoryId, catData.name, catData.description, tenant1Id]
    );
    savedCategories1.push({ id: categoryId, name: catData.name });
    console.log(`  ✅ Created category: ${catData.name}`);
  }

  // Tenant 1 Products
  const products1 = [
    {
      name: 'Coca Cola 1L',
      sku: 'COCA-1L',
      barcode: '8690632001234',
      category: savedCategories1[0],
      unitPrice: 15.50,
      costPrice: 12.00,
      stockQuantity: 50,
      minStockLevel: 10,
    },
    {
      name: 'Fanta 1L',
      sku: 'FANTA-1L',
      barcode: '8690632001241',
      category: savedCategories1[0],
      unitPrice: 15.50,
      costPrice: 12.00,
      stockQuantity: 30,
      minStockLevel: 10,
    },
    {
      name: 'Eti Browni',
      sku: 'BROWNI-50G',
      barcode: '8690632001258',
      category: savedCategories1[1],
      unitPrice: 8.50,
      costPrice: 6.00,
      stockQuantity: 100,
      minStockLevel: 20,
    },
    {
      name: 'Ülker Çikolatalı Gofret',
      sku: 'GOFRET-ULKER',
      barcode: '8690632001265',
      category: savedCategories1[1],
      unitPrice: 5.00,
      costPrice: 3.50,
      stockQuantity: 150,
      minStockLevel: 30,
    },
    {
      name: 'Ekmek (Beyaz)',
      sku: 'EKMEK-BEYAZ',
      category: savedCategories1[2],
      unitPrice: 3.50,
      costPrice: 2.00,
      stockQuantity: 20,
      minStockLevel: 5,
    },
    {
      name: 'Makarna (500g)',
      sku: 'MAKARNA-500G',
      category: savedCategories1[2],
      unitPrice: 12.00,
      costPrice: 8.00,
      stockQuantity: 40,
      minStockLevel: 10,
    },
    {
      name: 'Süt (1L)',
      sku: 'SUT-1L',
      category: savedCategories1[3],
      unitPrice: 18.00,
      costPrice: 14.00,
      stockQuantity: 25,
      minStockLevel: 5,
    },
    {
      name: 'Beyaz Peynir (500g)',
      sku: 'PEYNIR-500G',
      category: savedCategories1[3],
      unitPrice: 45.00,
      costPrice: 35.00,
      stockQuantity: 15,
      minStockLevel: 3,
    },
  ];

  const savedProducts1: { id: string; name: string; unitPrice: number; costPrice: number; stockQuantity: number }[] = [];
  for (const prodData of products1) {
    const productId = randomUUID();
    const categoryId = savedCategories1.find(c => c.name === prodData.category.name)?.id || savedCategories1[0].id;
    await dataSource.query(
      `INSERT INTO "products"("id", "name", "sku", "barcode", "categoryId", "tenantId", "unitPrice", "costPrice", "stockQuantity", "minStockLevel", "isActive", "createdAt", "updatedAt") VALUES (@0, @1, @2, @3, @4, @5, @6, @7, @8, @9, @10, GETDATE(), GETDATE())`,
      [
        productId,
        prodData.name,
        prodData.sku,
        prodData.barcode || null,
        categoryId,
        tenant1Id,
        prodData.unitPrice,
        prodData.costPrice,
        prodData.stockQuantity,
        prodData.minStockLevel,
        1
      ]
    );
    savedProducts1.push({
      id: productId,
      name: prodData.name,
      unitPrice: prodData.unitPrice,
      costPrice: prodData.costPrice,
      stockQuantity: prodData.stockQuantity,
    });
    console.log(`  ✅ Created product: ${prodData.name}`);
  }

  // Demo Tenant 2: "Market Can"
  const tenant2Id = randomUUID();
  await dataSource.query(
    `INSERT INTO "tenants"("id", "name", "address", "phone", "email", "isActive", "createdAt", "updatedAt") VALUES (@0, @1, @2, @3, @4, @5, GETDATE(), GETDATE())`,
    [tenant2Id, 'Market Can', 'Beşiktaş, İstanbul', '+90 555 987 6543', 'info@marketcan.com', 1]
  );
  console.log(`✅ Created tenant: Market Can`);

  // Tenant 2 Admin
  const tenant2AdminId = randomUUID();
  await dataSource.query(
    `INSERT INTO "users"("id", "email", "passwordHash", "firstName", "lastName", "tenantId", "isActive", "createdAt", "updatedAt") VALUES (@0, @1, @2, @3, @4, @5, @6, GETDATE(), GETDATE())`,
    [tenant2AdminId, 'admin@marketcan.com', passwordHash, 'Can', 'Özkan', tenant2Id, 1]
  );
  await dataSource.query(
    `INSERT INTO "user_roles"("userId", "roleId", "assignedBy", "assignedAt") VALUES (@0, @1, @2, GETDATE())`,
    [tenant2AdminId, tenantAdminRole.id, tenant2AdminId]
  );
  console.log(`  ✅ Created admin user: admin@marketcan.com`);

  // Tenant 2 Categories
  const categories2 = [
    { name: 'Meyve & Sebze', description: 'Taze meyve ve sebzeler' },
    { name: 'Et & Tavuk', description: 'Et ve tavuk ürünleri' },
    { name: 'Temizlik', description: 'Temizlik malzemeleri' },
  ];

  const savedCategories2: { id: string; name: string }[] = [];
  for (const catData of categories2) {
    const categoryId = randomUUID();
    await dataSource.query(
      `INSERT INTO "categories"("id", "name", "description", "tenantId", "createdAt", "updatedAt") VALUES (@0, @1, @2, @3, GETDATE(), GETDATE())`,
      [categoryId, catData.name, catData.description, tenant2Id]
    );
    savedCategories2.push({ id: categoryId, name: catData.name });
    console.log(`  ✅ Created category: ${catData.name}`);
  }

  // Tenant 2 Products
  const products2 = [
    {
      name: 'Elma (Kırmızı)',
      sku: 'ELMA-KIRMIZI',
      category: savedCategories2[0],
      unitPrice: 25.00,
      costPrice: 18.00,
      stockQuantity: 30,
      minStockLevel: 10,
    },
    {
      name: 'Muz',
      sku: 'MUZ',
      category: savedCategories2[0],
      unitPrice: 35.00,
      costPrice: 25.00,
      stockQuantity: 20,
      minStockLevel: 5,
    },
    {
      name: 'Kıyma (500g)',
      sku: 'KIYMA-500G',
      category: savedCategories2[1],
      unitPrice: 120.00,
      costPrice: 95.00,
      stockQuantity: 10,
      minStockLevel: 3,
    },
    {
      name: 'Tavuk Göğüs (500g)',
      sku: 'TAVUK-500G',
      category: savedCategories2[1],
      unitPrice: 85.00,
      costPrice: 65.00,
      stockQuantity: 8,
      minStockLevel: 2,
    },
    {
      name: 'Çamaşır Deterjanı',
      sku: 'DETERJAN',
      category: savedCategories2[2],
      unitPrice: 45.00,
      costPrice: 35.00,
      stockQuantity: 25,
      minStockLevel: 5,
    },
  ];

  const savedProducts2: { id: string; name: string; unitPrice: number; costPrice: number; stockQuantity: number }[] = [];
  for (const prodData of products2) {
    const productId = randomUUID();
    const categoryId = savedCategories2.find(c => c.name === prodData.category.name)?.id || savedCategories2[0].id;
    await dataSource.query(
      `INSERT INTO "products"("id", "name", "sku", "barcode", "categoryId", "tenantId", "unitPrice", "costPrice", "stockQuantity", "minStockLevel", "isActive", "createdAt", "updatedAt") VALUES (@0, @1, @2, NULL, @3, @4, @5, @6, @7, @8, @9, GETDATE(), GETDATE())`,
      [
        productId,
        prodData.name,
        prodData.sku,
        categoryId,
        tenant2Id,
        prodData.unitPrice,
        prodData.costPrice,
        prodData.stockQuantity,
        prodData.minStockLevel,
        1
      ]
    );
    savedProducts2.push({
      id: productId,
      name: prodData.name,
      unitPrice: prodData.unitPrice,
      costPrice: prodData.costPrice,
      stockQuantity: prodData.stockQuantity,
    });
    console.log(`  ✅ Created product: ${prodData.name}`);
  }

  // Stock Movements - Initial stock (PURCHASE)
  console.log('\n📦 Creating stock movements...');
  for (const product of savedProducts1) {
    const movementId = randomUUID();
    await dataSource.query(
      `INSERT INTO "stock_movements"("id", "productId", "tenantId", "movementType", "quantity", "unitPrice", "referenceId", "notes", "createdBy", "createdAt") VALUES (@0, @1, @2, @3, @4, @5, NULL, @6, @7, GETDATE())`,
      [
        movementId,
        product.id,
        tenant1Id,
        StockMovementType.PURCHASE,
        product.stockQuantity,
        product.costPrice,
        `İlk stok girişi - ${product.name}`,
        tenant1AdminId,
      ]
    );
  }
  console.log(`  ✅ Created ${savedProducts1.length} stock movements for Tenant 1`);

  for (const product of savedProducts2) {
    const movementId = randomUUID();
    await dataSource.query(
      `INSERT INTO "stock_movements"("id", "productId", "tenantId", "movementType", "quantity", "unitPrice", "referenceId", "notes", "createdBy", "createdAt") VALUES (@0, @1, @2, @3, @4, @5, NULL, @6, @7, GETDATE())`,
      [
        movementId,
        product.id,
        tenant2Id,
        StockMovementType.PURCHASE,
        product.stockQuantity,
        product.costPrice,
        `İlk stok girişi - ${product.name}`,
        tenant2AdminId,
      ]
    );
  }
  console.log(`  ✅ Created ${savedProducts2.length} stock movements for Tenant 2`);

  // Sales - Tenant 1
  console.log('\n💰 Creating sales...');
  
  // Sale 1: Bakkal Ahmet - Small sale
  const sale1Id = randomUUID();
  const sale1Number = `BA-${Date.now()}-001`;
  const sale1Items = [
    { product: savedProducts1[0], quantity: 2, discount: 0 }, // Coca Cola
    { product: savedProducts1[2], quantity: 3, discount: 0 }, // Eti Browni
  ];
  const sale1Total = sale1Items.reduce((sum, item) => sum + (item.product.unitPrice * item.quantity), 0);
  const sale1Final = sale1Total;

  await dataSource.query(
    `INSERT INTO "sales"("id", "tenantId", "saleNumber", "totalAmount", "discountAmount", "finalAmount", "paymentMethod", "cashierId", "createdAt") VALUES (@0, @1, @2, @3, @4, @5, @6, @7, GETDATE())`,
    [sale1Id, tenant1Id, sale1Number, sale1Total, 0, sale1Final, PaymentMethod.CASH, tenant1CashierId]
  );

  for (const item of sale1Items) {
    const itemId = randomUUID();
    const lineTotal = (item.product.unitPrice * item.quantity) - item.discount;
    await dataSource.query(
      `INSERT INTO "sale_items"("id", "saleId", "productId", "quantity", "unitPrice", "discountAmount", "lineTotal") VALUES (@0, @1, @2, @3, @4, @5, @6)`,
      [itemId, sale1Id, item.product.id, item.quantity, item.product.unitPrice, item.discount, lineTotal]
    );

    // Stock movement for sale
    const stockMovementId = randomUUID();
    await dataSource.query(
      `INSERT INTO "stock_movements"("id", "productId", "tenantId", "movementType", "quantity", "unitPrice", "referenceId", "notes", "createdBy", "createdAt") VALUES (@0, @1, @2, @3, @4, @5, @6, @7, @8, GETDATE())`,
      [
        stockMovementId,
        item.product.id,
        tenant1Id,
        StockMovementType.SALE,
        item.quantity,
        item.product.unitPrice,
        sale1Id,
        `Satış: ${sale1Number}`,
        tenant1CashierId,
      ]
    );
  }
  console.log(`  ✅ Created sale: ${sale1Number} (${sale1Items.length} items, Total: ${sale1Final.toFixed(2)} TL)`);

  // Sale 2: Bakkal Ahmet - Larger sale with discount
  const sale2Id = randomUUID();
  const sale2Number = `BA-${Date.now()}-002`;
  const sale2Items = [
    { product: savedProducts1[1], quantity: 1, discount: 0 }, // Fanta
    { product: savedProducts1[3], quantity: 5, discount: 2.50 }, // Ülker Gofret
    { product: savedProducts1[4], quantity: 2, discount: 0 }, // Ekmek
    { product: savedProducts1[6], quantity: 1, discount: 0 }, // Süt
  ];
  const sale2Total = sale2Items.reduce((sum, item) => sum + (item.product.unitPrice * item.quantity), 0);
  const sale2Discount = sale2Items.reduce((sum, item) => sum + item.discount, 0);
  const sale2Final = sale2Total - sale2Discount;

  await dataSource.query(
    `INSERT INTO "sales"("id", "tenantId", "saleNumber", "totalAmount", "discountAmount", "finalAmount", "paymentMethod", "cashierId", "createdAt") VALUES (@0, @1, @2, @3, @4, @5, @6, @7, GETDATE())`,
    [sale2Id, tenant1Id, sale2Number, sale2Total, sale2Discount, sale2Final, PaymentMethod.CARD, tenant1CashierId]
  );

  for (const item of sale2Items) {
    const itemId = randomUUID();
    const lineTotal = (item.product.unitPrice * item.quantity) - item.discount;
    await dataSource.query(
      `INSERT INTO "sale_items"("id", "saleId", "productId", "quantity", "unitPrice", "discountAmount", "lineTotal") VALUES (@0, @1, @2, @3, @4, @5, @6)`,
      [itemId, sale2Id, item.product.id, item.quantity, item.product.unitPrice, item.discount, lineTotal]
    );

    // Stock movement for sale
    const stockMovementId = randomUUID();
    await dataSource.query(
      `INSERT INTO "stock_movements"("id", "productId", "tenantId", "movementType", "quantity", "unitPrice", "referenceId", "notes", "createdBy", "createdAt") VALUES (@0, @1, @2, @3, @4, @5, @6, @7, @8, GETDATE())`,
      [
        stockMovementId,
        item.product.id,
        tenant1Id,
        StockMovementType.SALE,
        item.quantity,
        item.product.unitPrice,
        sale2Id,
        `Satış: ${sale2Number}`,
        tenant1CashierId,
      ]
    );
  }
  console.log(`  ✅ Created sale: ${sale2Number} (${sale2Items.length} items, Total: ${sale2Total.toFixed(2)} TL, Discount: ${sale2Discount.toFixed(2)} TL, Final: ${sale2Final.toFixed(2)} TL)`);

  // Sale 3: Market Can
  const sale3Id = randomUUID();
  const sale3Number = `MC-${Date.now()}-001`;
  const sale3Items = [
    { product: savedProducts2[0], quantity: 2, discount: 0 }, // Elma
    { product: savedProducts2[1], quantity: 1, discount: 0 }, // Muz
    { product: savedProducts2[4], quantity: 1, discount: 0 }, // Deterjan
  ];
  const sale3Total = sale3Items.reduce((sum, item) => sum + (item.product.unitPrice * item.quantity), 0);
  const sale3Final = sale3Total;

  await dataSource.query(
    `INSERT INTO "sales"("id", "tenantId", "saleNumber", "totalAmount", "discountAmount", "finalAmount", "paymentMethod", "cashierId", "createdAt") VALUES (@0, @1, @2, @3, @4, @5, @6, @7, GETDATE())`,
    [sale3Id, tenant2Id, sale3Number, sale3Total, 0, sale3Final, PaymentMethod.CASH, tenant2AdminId]
  );

  for (const item of sale3Items) {
    const itemId = randomUUID();
    const lineTotal = (item.product.unitPrice * item.quantity) - item.discount;
    await dataSource.query(
      `INSERT INTO "sale_items"("id", "saleId", "productId", "quantity", "unitPrice", "discountAmount", "lineTotal") VALUES (@0, @1, @2, @3, @4, @5, @6)`,
      [itemId, sale3Id, item.product.id, item.quantity, item.product.unitPrice, item.discount, lineTotal]
    );

    // Stock movement for sale
    const stockMovementId = randomUUID();
    await dataSource.query(
      `INSERT INTO "stock_movements"("id", "productId", "tenantId", "movementType", "quantity", "unitPrice", "referenceId", "notes", "createdBy", "createdAt") VALUES (@0, @1, @2, @3, @4, @5, @6, @7, @8, GETDATE())`,
      [
        stockMovementId,
        item.product.id,
        tenant2Id,
        StockMovementType.SALE,
        item.quantity,
        item.product.unitPrice,
        sale3Id,
        `Satış: ${sale3Number}`,
        tenant2AdminId,
      ]
    );
  }
  console.log(`  ✅ Created sale: ${sale3Number} (${sale3Items.length} items, Total: ${sale3Final.toFixed(2)} TL)`);

  console.log('\n✅ Demo data seeding completed!');
  console.log(`\n📊 Özet:`);
  console.log(`  - 2 Tenant oluşturuldu`);
  console.log(`  - 3 Kullanıcı oluşturuldu (2 Admin, 1 Cashier)`);
  console.log(`  - 7 Kategori oluşturuldu`);
  console.log(`  - 13 Ürün oluşturuldu`);
  console.log(`  - ${savedProducts1.length + savedProducts2.length} Stok hareketi oluşturuldu (PURCHASE)`);
  console.log(`  - 3 Satış oluşturuldu`);
  console.log(`  - ${sale1Items.length + sale2Items.length + sale3Items.length} Satış kalemi oluşturuldu`);
  console.log(`  - ${sale1Items.length + sale2Items.length + sale3Items.length} Stok hareketi oluşturuldu (SALE)`);
}

