import { DataSource } from 'typeorm';
import { TenantEntity } from '../entities/tenant.typeorm-entity';
import { UserEntity } from '../entities/user.typeorm-entity';
import { UserRoleEntity } from '../entities/user-role.typeorm-entity';
import { CategoryEntity } from '../entities/category.typeorm-entity';
import { ProductEntity } from '../entities/product.typeorm-entity';
import { RoleName } from '../../../../domain/users/entities/role.entity';
import { RoleEntity } from '../entities/role.typeorm-entity';
import * as bcrypt from 'bcrypt';

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

  // Get roles
  const tenantAdminRole = await roleRepository.findOneBy({ name: RoleName.TENANT_ADMIN });
  const cashierRole = await roleRepository.findOneBy({ name: RoleName.CASHIER });
  const viewerRole = await roleRepository.findOneBy({ name: RoleName.VIEWER });

  if (!tenantAdminRole || !cashierRole || !viewerRole) {
    throw new Error('Required roles not found. Please run seedDefaultRoles first.');
  }

  const passwordHash = await bcrypt.hash('Demo123!', 10);

  // Demo Tenant 1: "Bakkal Ahmet"
  const tenant1 = tenantRepository.create({
    name: 'Bakkal Ahmet',
    address: 'Kadıköy, İstanbul',
    phone: '+90 555 123 4567',
    email: 'ahmet@bakkal.com',
    isActive: true,
  });
  const savedTenant1 = await tenantRepository.save(tenant1);
  const tenant1Id = savedTenant1.id;
  console.log(`✅ Created tenant: ${savedTenant1.name}`);

  // Tenant 1 Users
  const tenant1Admin = userRepository.create({
    email: 'admin@bakkal-ahmet.com',
    passwordHash,
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    tenantId: tenant1Id,
    isActive: true,
  });
  const savedTenant1Admin = await userRepository.save(tenant1Admin);
  const tenant1AdminId = savedTenant1Admin.id;
  await userRoleRepository.save(
    userRoleRepository.create({
      userId: tenant1AdminId,
      roleId: tenantAdminRole.id,
      assignedBy: tenant1AdminId,
    }),
  );
  console.log(`  ✅ Created admin user: ${savedTenant1Admin.email}`);

  const tenant1Cashier = userRepository.create({
    email: 'kasiyer@bakkal-ahmet.com',
    passwordHash,
    firstName: 'Mehmet',
    lastName: 'Demir',
    tenantId: tenant1Id,
    isActive: true,
  });
  const savedTenant1Cashier = await userRepository.save(tenant1Cashier);
  const tenant1CashierId = savedTenant1Cashier.id;
  await userRoleRepository.save(
    userRoleRepository.create({
      userId: tenant1CashierId,
      roleId: cashierRole.id,
      assignedBy: tenant1AdminId,
    }),
  );
  console.log(`  ✅ Created cashier user: ${savedTenant1Cashier.email}`);

  // Tenant 1 Categories
  const categories1 = [
    { name: 'İçecekler', description: 'Su, meyve suyu, gazlı içecekler' },
    { name: 'Atıştırmalık', description: 'Çikolata, bisküvi, cips' },
    { name: 'Temel Gıda', description: 'Ekmek, makarna, pirinç' },
    { name: 'Süt Ürünleri', description: 'Süt, peynir, yoğurt' },
  ];

  const savedCategories1: CategoryEntity[] = [];
  for (const catData of categories1) {
    const category = categoryRepository.create({
      name: catData.name,
      description: catData.description,
      tenantId: tenant1Id,
    });
    const saved = await categoryRepository.save(category);
    savedCategories1.push(saved);
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

  for (const prodData of products1) {
    const product = productRepository.create({
      name: prodData.name,
      sku: prodData.sku,
      barcode: prodData.barcode,
      categoryId: prodData.category.id,
      tenantId: tenant1Id,
      unitPrice: prodData.unitPrice,
      costPrice: prodData.costPrice,
      stockQuantity: prodData.stockQuantity,
      minStockLevel: prodData.minStockLevel,
      isActive: true,
    });
    await productRepository.save(product);
    console.log(`  ✅ Created product: ${prodData.name}`);
  }

  // Demo Tenant 2: "Market Can"
  const tenant2 = tenantRepository.create({
    name: 'Market Can',
    address: 'Beşiktaş, İstanbul',
    phone: '+90 555 987 6543',
    email: 'info@marketcan.com',
    isActive: true,
  });
  const savedTenant2 = await tenantRepository.save(tenant2);
  const tenant2Id = savedTenant2.id;
  console.log(`✅ Created tenant: ${savedTenant2.name}`);

  // Tenant 2 Admin
  const tenant2Admin = userRepository.create({
    email: 'admin@marketcan.com',
    passwordHash,
    firstName: 'Can',
    lastName: 'Özkan',
    tenantId: tenant2Id,
    isActive: true,
  });
  const savedTenant2Admin = await userRepository.save(tenant2Admin);
  const tenant2AdminId = savedTenant2Admin.id;
  await userRoleRepository.save(
    userRoleRepository.create({
      userId: tenant2AdminId,
      roleId: tenantAdminRole.id,
      assignedBy: tenant2AdminId,
    }),
  );
  console.log(`  ✅ Created admin user: ${savedTenant2Admin.email}`);

  // Tenant 2 Categories
  const categories2 = [
    { name: 'Meyve & Sebze', description: 'Taze meyve ve sebzeler' },
    { name: 'Et & Tavuk', description: 'Et ve tavuk ürünleri' },
    { name: 'Temizlik', description: 'Temizlik malzemeleri' },
  ];

  const savedCategories2: CategoryEntity[] = [];
  for (const catData of categories2) {
    const category = categoryRepository.create({
      name: catData.name,
      description: catData.description,
      tenantId: tenant2Id,
    });
    const saved = await categoryRepository.save(category);
    savedCategories2.push(saved);
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

  for (const prodData of products2) {
    const product = productRepository.create({
      name: prodData.name,
      sku: prodData.sku,
      categoryId: prodData.category.id,
      tenantId: tenant2Id,
      unitPrice: prodData.unitPrice,
      costPrice: prodData.costPrice,
      stockQuantity: prodData.stockQuantity,
      minStockLevel: prodData.minStockLevel,
      isActive: true,
    });
    await productRepository.save(product);
    console.log(`  ✅ Created product: ${prodData.name}`);
  }

  console.log('✅ Demo data seeding completed!');
}

