import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Convert all ID columns from varchar to uniqueidentifier
 * and datetime columns to datetime2
 * 
 * Migration order (by dependency):
 * 1. roles (independent)
 * 2. tenants (independent)
 * 3. users (depends on tenants)
 * 4. user_roles (depends on users, roles)
 * 5. categories (depends on tenants)
 * 6. products (depends on categories, tenants)
 * 7. stock_movements (depends on products, tenants, users)
 * 8. sales (depends on tenants, users)
 * 9. sale_items (depends on sales, products)
 */
export class AddNewFeature1767922494056 implements MigrationInterface {
    name = 'AddNewFeature1767922494056'

    /**
     * Helper: Migrate a table by preserving data using temporary table approach
     */
    private async migrateTableWithDataPreservation(
        queryRunner: QueryRunner,
        tableName: string,
        tempTableName: string,
        oldColumns: string[],
        newTableDefinition: string,
        dataMappingQuery: string
    ): Promise<void> {
        // Create temporary table
        await queryRunner.query(`CREATE TABLE "${tempTableName}" (${oldColumns.join(', ')})`);
        
        // Copy data to temporary table
        await queryRunner.query(`INSERT INTO "${tempTableName}" SELECT * FROM "${tableName}"`);
        
        // Drop original table
        await queryRunner.query(`DROP TABLE "${tableName}"`);
        
        // Create new table
        await queryRunner.query(`CREATE TABLE "${tableName}" ${newTableDefinition}`);
        
        // Copy data back with mapping
        await queryRunner.query(dataMappingQuery);
        
        // Drop temporary table
        await queryRunner.query(`DROP TABLE "${tempTableName}"`);
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Drop all foreign keys to allow column type changes
        const foreignKeys = [
            'FK_86033897c009fcca8b6505d6be2', // user_roles -> roles
            'FK_472b25323af01488f1f66a06b67', // user_roles -> users
            'FK_c58f7e88c286e5e3478960a998b', // users -> tenants
            'FK_46a85229c9953b2b94f768190b2', // categories -> tenants
            'FK_ff56834e735fa78a15d0cf21926', // products -> categories
            'FK_6804855ba1a19523ea57e0769b4', // products -> tenants
            'FK_a3acb59db67e977be45e382fc56', // stock_movements -> products
            'FK_7dde280faf0d06b5b1b067b8ac1', // stock_movements -> tenants
            'FK_84145471dd808c370c12861afca', // stock_movements -> users
            'FK_37606c7b1560c6be428c7a48959', // sales -> tenants
            'FK_3b04a33c33ed9653a8a3cd316c5', // sales -> users
            'FK_c642be08de5235317d4cf3deb40', // sale_items -> sales
            'FK_d675aea38a16313e844662c48f8', // sale_items -> products
        ];

        for (const fkName of foreignKeys) {
            const fk = await queryRunner.query(`
                SELECT 
                    OBJECT_SCHEMA_NAME(parent_object_id) AS schema_name,
                    OBJECT_NAME(parent_object_id) AS table_name,
                    name
                FROM sys.foreign_keys 
                WHERE name = '${fkName}'
            `);
            if (fk.length > 0) {
                await queryRunner.query(`ALTER TABLE "${fk[0].table_name}" DROP CONSTRAINT "${fkName}"`);
            }
        }

        // Drop indexes that will be recreated
        const indexesToDrop = [
            { table: 'users', index: 'IDX_f006b5ade3eda4824fdff0785f' },
            { table: 'categories', index: 'IDX_5a863c246e26467995e50b1b1f' },
            { table: 'products', index: 'IDX_1c7c746bdf7932b41227332812' },
            { table: 'products', index: 'IDX_1b6c1ded9006ffc8e024caa715' },
            { table: 'stock_movements', index: 'IDX_fe8f81647152d8bfb9c7c4e490' },
            { table: 'sales', index: 'IDX_e96ec22f56c541a81549f653f1' },
            { table: 'user_roles', index: 'IDX_472b25323af01488f1f66a06b6' },
            { table: 'user_roles', index: 'IDX_86033897c009fcca8b6505d6be' },
        ];

        for (const { table, index } of indexesToDrop) {
            const idx = await queryRunner.query(`
                SELECT name FROM sys.indexes 
                WHERE name = '${index}' AND object_id = OBJECT_ID('${table}')
            `);
            if (idx.length > 0) {
                await queryRunner.query(`DROP INDEX "${index}" ON "${table}"`);
            }
        }

        // ============================================
        // Step 2: Migrate roles (independent)
        // ============================================
        const rolesPK = await queryRunner.query(`
            SELECT name FROM sys.key_constraints 
            WHERE type = 'PK' AND parent_object_id = OBJECT_ID('roles')
        `);
        if (rolesPK.length > 0) {
            await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "${rolesPK[0].name}"`);
        }

        await queryRunner.query(`CREATE TABLE "temp_roles" (
            "id" varchar(36) NOT NULL,
            "name" nvarchar(50) NOT NULL,
            "description" nvarchar(500),
            "createdAt" datetime NOT NULL
        )`);
        await queryRunner.query(`INSERT INTO "temp_roles" SELECT "id", "name", "description", "createdAt" FROM "roles"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`CREATE TABLE "roles" (
            "id" uniqueidentifier NOT NULL CONSTRAINT "DF_c1433d71a4838793a49dcad46ab" DEFAULT NEWSEQUENTIALID(),
            "name" nvarchar(50) NOT NULL,
            "description" nvarchar(500),
            "createdAt" datetime2 NOT NULL CONSTRAINT "DF_4d018866397b1e7e78d03b45662" DEFAULT getdate(),
            CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name")
        )`);
        await queryRunner.query(`INSERT INTO "roles" ("id", "name", "description", "createdAt")
            SELECT CAST("id" AS uniqueidentifier), "name", "description", CAST("createdAt" AS datetime2)
            FROM "temp_roles"`);
        await queryRunner.query(`DROP TABLE "temp_roles"`);

        // ============================================
        // Step 3: Migrate tenants (independent)
        // ============================================
        const tenantsPK = await queryRunner.query(`
            SELECT name FROM sys.key_constraints 
            WHERE type = 'PK' AND parent_object_id = OBJECT_ID('tenants')
        `);
        if (tenantsPK.length > 0) {
            await queryRunner.query(`ALTER TABLE "tenants" DROP CONSTRAINT "${tenantsPK[0].name}"`);
        }

        await queryRunner.query(`CREATE TABLE "temp_tenants" (
            "id" varchar(36) NOT NULL,
            "name" nvarchar(255) NOT NULL,
            "address" nvarchar(500),
            "phone" nvarchar(50),
            "email" nvarchar(255),
            "isActive" bit NOT NULL,
            "createdAt" datetime NOT NULL,
            "updatedAt" datetime NOT NULL
        )`);
        await queryRunner.query(`INSERT INTO "temp_tenants" SELECT "id", "name", "address", "phone", "email", "isActive", "createdAt", "updatedAt" FROM "tenants"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
        await queryRunner.query(`CREATE TABLE "tenants" (
            "id" uniqueidentifier NOT NULL CONSTRAINT "DF_53be67a04681c66b87ee27c9321" DEFAULT NEWSEQUENTIALID(),
            "name" nvarchar(255) NOT NULL,
            "address" nvarchar(500),
            "phone" nvarchar(50),
            "email" nvarchar(255),
            "isActive" bit NOT NULL DEFAULT 1,
            "createdAt" datetime2 NOT NULL CONSTRAINT "DF_6ad29f70b20275660ba5a352455" DEFAULT getdate(),
            "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_71478a9ce634ac96176da38e3ce" DEFAULT getdate(),
            CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_32731f181236a46182a38c992a8" UNIQUE ("name")
        )`);
        await queryRunner.query(`INSERT INTO "tenants" ("id", "name", "address", "phone", "email", "isActive", "createdAt", "updatedAt")
            SELECT CAST("id" AS uniqueidentifier), "name", "address", "phone", "email", "isActive", CAST("createdAt" AS datetime2), CAST("updatedAt" AS datetime2)
            FROM "temp_tenants"`);
        await queryRunner.query(`DROP TABLE "temp_tenants"`);

        // ============================================
        // Step 4: Migrate users (depends on tenants)
        // ============================================
        const usersPK = await queryRunner.query(`
            SELECT name FROM sys.key_constraints 
            WHERE type = 'PK' AND parent_object_id = OBJECT_ID('users')
        `);
        if (usersPK.length > 0) {
            await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "${usersPK[0].name}"`);
        }

        await queryRunner.query(`CREATE TABLE "temp_users" (
            "id" varchar(36) NOT NULL,
            "email" nvarchar(255) NOT NULL,
            "passwordHash" nvarchar(255) NOT NULL,
            "firstName" nvarchar(100) NOT NULL,
            "lastName" nvarchar(100) NOT NULL,
            "tenantId" varchar(36),
            "isActive" bit NOT NULL,
            "createdAt" datetime NOT NULL,
            "updatedAt" datetime NOT NULL
        )`);
        await queryRunner.query(`INSERT INTO "temp_users" SELECT "id", "email", "passwordHash", "firstName", "lastName", "tenantId", "isActive", "createdAt", "updatedAt" FROM "users"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`CREATE TABLE "users" (
            "id" uniqueidentifier NOT NULL CONSTRAINT "DF_a3ffb1c0c8416b9fc6f907b7433" DEFAULT NEWSEQUENTIALID(),
            "email" nvarchar(255) NOT NULL,
            "passwordHash" nvarchar(255) NOT NULL,
            "firstName" nvarchar(100) NOT NULL,
            "lastName" nvarchar(100) NOT NULL,
            "tenantId" uniqueidentifier,
            "isActive" bit NOT NULL DEFAULT 1,
            "createdAt" datetime2 NOT NULL CONSTRAINT "DF_204e9b624861ff4a5b268192101" DEFAULT getdate(),
            "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_0f5cbe00928ba4489cc7312573b" DEFAULT getdate(),
            CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`INSERT INTO "users" ("id", "email", "passwordHash", "firstName", "lastName", "tenantId", "isActive", "createdAt", "updatedAt")
            SELECT 
                CAST("id" AS uniqueidentifier),
                "email",
                "passwordHash",
                "firstName",
                "lastName",
                CASE WHEN "tenantId" IS NOT NULL THEN CAST("tenantId" AS uniqueidentifier) ELSE NULL END,
                "isActive",
                CAST("createdAt" AS datetime2),
                CAST("updatedAt" AS datetime2)
            FROM "temp_users"`);
        await queryRunner.query(`DROP TABLE "temp_users"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f006b5ade3eda4824fdff0785f" ON "users" ("email", "tenantId") WHERE tenantId IS NOT NULL`);

        // ============================================
        // Step 5: Migrate user_roles (depends on users, roles)
        // ============================================
        const userRolesPK = await queryRunner.query(`
            SELECT name FROM sys.key_constraints 
            WHERE type = 'PK' AND parent_object_id = OBJECT_ID('user_roles')
        `);
        if (userRolesPK.length > 0) {
            await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "${userRolesPK[0].name}"`);
        }

        await queryRunner.query(`CREATE TABLE "temp_user_roles" (
            "userId" varchar(36) NOT NULL,
            "roleId" varchar(36) NOT NULL,
            "assignedAt" datetime NOT NULL,
            "assignedBy" varchar(36) NOT NULL
        )`);
        await queryRunner.query(`INSERT INTO "temp_user_roles" SELECT "userId", "roleId", "assignedAt", "assignedBy" FROM "user_roles"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`CREATE TABLE "user_roles" (
            "userId" uniqueidentifier NOT NULL,
            "roleId" uniqueidentifier NOT NULL,
            "assignedAt" datetime2 NOT NULL CONSTRAINT "DF_f054fe4294290277b417d2f76f6" DEFAULT getdate(),
            "assignedBy" uniqueidentifier NOT NULL,
            CONSTRAINT "PK_88481b0c4ed9ada47e9fdd67475" PRIMARY KEY ("userId", "roleId")
        )`);
        
        // Get first admin user for assignedBy fallback
        const adminUser = await queryRunner.query(`
            SELECT TOP 1 u.id FROM users u
            INNER JOIN user_roles ur ON ur.userId = u.id
            INNER JOIN roles r ON r.id = ur.roleId
            WHERE r.name IN ('SuperAdmin', 'TenantAdmin')
            ORDER BY u.createdAt ASC
        `);
        const defaultAssignedBy = adminUser.length > 0 ? adminUser[0].id : null;
        
        if (defaultAssignedBy) {
            await queryRunner.query(`INSERT INTO "user_roles" ("userId", "roleId", "assignedAt", "assignedBy")
                SELECT 
                    CAST("userId" AS uniqueidentifier),
                    CAST("roleId" AS uniqueidentifier),
                    CAST("assignedAt" AS datetime2),
                    COALESCE(
                        (SELECT TOP 1 "id" FROM "users" WHERE CAST("id" AS varchar(36)) = "temp_user_roles"."assignedBy"),
                        '${defaultAssignedBy}'
                    )
                FROM "temp_user_roles"`);
        } else {
            // Use userId as assignedBy if no admin found
            await queryRunner.query(`INSERT INTO "user_roles" ("userId", "roleId", "assignedAt", "assignedBy")
                SELECT 
                    CAST("userId" AS uniqueidentifier),
                    CAST("roleId" AS uniqueidentifier),
                    CAST("assignedAt" AS datetime2),
                    CAST("userId" AS uniqueidentifier)
                FROM "temp_user_roles"`);
        }
        await queryRunner.query(`DROP TABLE "temp_user_roles"`);
        await queryRunner.query(`CREATE INDEX "IDX_472b25323af01488f1f66a06b6" ON "user_roles" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_86033897c009fcca8b6505d6be" ON "user_roles" ("roleId")`);

        // ============================================
        // Step 6: Migrate categories (depends on tenants)
        // ============================================
        const categoriesPK = await queryRunner.query(`
            SELECT name FROM sys.key_constraints 
            WHERE type = 'PK' AND parent_object_id = OBJECT_ID('categories')
        `);
        if (categoriesPK.length > 0) {
            await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "${categoriesPK[0].name}"`);
        }

        await queryRunner.query(`CREATE TABLE "temp_categories" (
            "id" varchar(36) NOT NULL,
            "name" nvarchar(255) NOT NULL,
            "description" nvarchar(1000),
            "tenantId" varchar(36) NOT NULL,
            "createdAt" datetime NOT NULL,
            "updatedAt" datetime NOT NULL
        )`);
        await queryRunner.query(`INSERT INTO "temp_categories" SELECT "id", "name", "description", "tenantId", "createdAt", "updatedAt" FROM "categories"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`CREATE TABLE "categories" (
            "id" uniqueidentifier NOT NULL CONSTRAINT "DF_24dbc6126a28ff948da33e97d3b" DEFAULT NEWSEQUENTIALID(),
            "name" nvarchar(255) NOT NULL,
            "description" nvarchar(1000),
            "tenantId" uniqueidentifier NOT NULL,
            "createdAt" datetime2 NOT NULL CONSTRAINT "DF_43bf08375ae7bfae7d55bc3a0cc" DEFAULT getdate(),
            "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_12ab873251814ad54ddb41d45e4" DEFAULT getdate(),
            CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id")
        )`);
        
        const firstTenant = await queryRunner.query(`SELECT TOP 1 "id" FROM "tenants" ORDER BY "createdAt" ASC`);
        const defaultTenantId = firstTenant.length > 0 ? firstTenant[0].id : null;
        
        if (defaultTenantId) {
            await queryRunner.query(`INSERT INTO "categories" ("id", "name", "description", "tenantId", "createdAt", "updatedAt")
                SELECT 
                    CAST("id" AS uniqueidentifier),
                    "name",
                    "description",
                    COALESCE(
                        (SELECT TOP 1 "id" FROM "tenants" WHERE CAST("id" AS varchar(36)) = "temp_categories"."tenantId"),
                        '${defaultTenantId}'
                    ),
                    CAST("createdAt" AS datetime2),
                    CAST("updatedAt" AS datetime2)
                FROM "temp_categories"`);
        } else {
            throw new Error('No tenant found to map categories');
        }
        await queryRunner.query(`DROP TABLE "temp_categories"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5a863c246e26467995e50b1b1f" ON "categories" ("name", "tenantId")`);

        // ============================================
        // Step 7: Migrate products (depends on categories, tenants)
        // ============================================
        const productsPK = await queryRunner.query(`
            SELECT name FROM sys.key_constraints 
            WHERE type = 'PK' AND parent_object_id = OBJECT_ID('products')
        `);
        if (productsPK.length > 0) {
            await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "${productsPK[0].name}"`);
        }

        await queryRunner.query(`CREATE TABLE "temp_products" (
            "id" varchar(36) NOT NULL,
            "name" nvarchar(255) NOT NULL,
            "sku" nvarchar(100) NOT NULL,
            "barcode" nvarchar(100),
            "categoryId" varchar(36) NOT NULL,
            "tenantId" varchar(36) NOT NULL,
            "unitPrice" decimal(18,2) NOT NULL,
            "costPrice" decimal(18,2),
            "stockQuantity" decimal(18,2) NOT NULL,
            "minStockLevel" decimal(18,2) NOT NULL,
            "isActive" bit NOT NULL,
            "createdAt" datetime NOT NULL,
            "updatedAt" datetime NOT NULL
        )`);
        await queryRunner.query(`INSERT INTO "temp_products" SELECT "id", "name", "sku", "barcode", "categoryId", "tenantId", "unitPrice", "costPrice", "stockQuantity", "minStockLevel", "isActive", "createdAt", "updatedAt" FROM "products"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`CREATE TABLE "products" (
            "id" uniqueidentifier NOT NULL CONSTRAINT "DF_0806c755e0aca124e67c0cf6d7d" DEFAULT NEWSEQUENTIALID(),
            "name" nvarchar(255) NOT NULL,
            "sku" nvarchar(100) NOT NULL,
            "barcode" nvarchar(100),
            "categoryId" uniqueidentifier NOT NULL,
            "tenantId" uniqueidentifier NOT NULL,
            "unitPrice" decimal(18,2) NOT NULL,
            "costPrice" decimal(18,2),
            "stockQuantity" decimal(18,2) NOT NULL DEFAULT (0),
            "minStockLevel" decimal(18,2) NOT NULL DEFAULT (0),
            "isActive" bit NOT NULL DEFAULT 1,
            "createdAt" datetime2 NOT NULL CONSTRAINT "DF_63fcb3d8806a6efd53dbc674309" DEFAULT getdate(),
            "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_51287e43b0bd3e113a1ead339c1" DEFAULT getdate(),
            CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id")
        )`);
        
        const firstCategory = await queryRunner.query(`SELECT TOP 1 "id" FROM "categories" ORDER BY "createdAt" ASC`);
        const firstTenantForProducts = await queryRunner.query(`SELECT TOP 1 "id" FROM "tenants" ORDER BY "createdAt" ASC`);
        const defaultCategoryId = firstCategory.length > 0 ? firstCategory[0].id : null;
        const defaultTenantIdForProducts = firstTenantForProducts.length > 0 ? firstTenantForProducts[0].id : null;
        
        if (defaultCategoryId && defaultTenantIdForProducts) {
            await queryRunner.query(`INSERT INTO "products" ("id", "name", "sku", "barcode", "categoryId", "tenantId", "unitPrice", "costPrice", "stockQuantity", "minStockLevel", "isActive", "createdAt", "updatedAt")
                SELECT 
                    CAST("id" AS uniqueidentifier),
                    "name",
                    "sku",
                    "barcode",
                    COALESCE(
                        (SELECT TOP 1 "id" FROM "categories" WHERE CAST("id" AS varchar(36)) = "temp_products"."categoryId"),
                        '${defaultCategoryId}'
                    ),
                    COALESCE(
                        (SELECT TOP 1 "id" FROM "tenants" WHERE CAST("id" AS varchar(36)) = "temp_products"."tenantId"),
                        '${defaultTenantIdForProducts}'
                    ),
                    "unitPrice",
                    "costPrice",
                    "stockQuantity",
                    "minStockLevel",
                    "isActive",
                    CAST("createdAt" AS datetime2),
                    CAST("updatedAt" AS datetime2)
                FROM "temp_products"`);
        } else {
            throw new Error('No category or tenant found to map products');
        }
        await queryRunner.query(`DROP TABLE "temp_products"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1c7c746bdf7932b41227332812" ON "products" ("barcode", "tenantId") WHERE barcode IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1b6c1ded9006ffc8e024caa715" ON "products" ("sku", "tenantId")`);

        // ============================================
        // Step 8: Migrate stock_movements (depends on products, tenants, users)
        // ============================================
        const stockMovementsPK = await queryRunner.query(`
            SELECT name FROM sys.key_constraints 
            WHERE type = 'PK' AND parent_object_id = OBJECT_ID('stock_movements')
        `);
        if (stockMovementsPK.length > 0) {
            await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "${stockMovementsPK[0].name}"`);
        }

        await queryRunner.query(`CREATE TABLE "temp_stock_movements" (
            "id" varchar(36) NOT NULL,
            "productId" varchar(36) NOT NULL,
            "tenantId" varchar(36) NOT NULL,
            "movementType" nvarchar(20) NOT NULL,
            "quantity" decimal(18,2) NOT NULL,
            "unitPrice" decimal(18,2) NOT NULL,
            "referenceId" varchar(36),
            "notes" nvarchar(1000),
            "createdBy" varchar(36) NOT NULL,
            "createdAt" datetime NOT NULL
        )`);
        await queryRunner.query(`INSERT INTO "temp_stock_movements" SELECT "id", "productId", "tenantId", "movementType", "quantity", "unitPrice", "referenceId", "notes", "createdBy", "createdAt" FROM "stock_movements"`);
        await queryRunner.query(`DROP TABLE "stock_movements"`);
        await queryRunner.query(`CREATE TABLE "stock_movements" (
            "id" uniqueidentifier NOT NULL CONSTRAINT "DF_57a26b190618550d8e65fb860e7" DEFAULT NEWSEQUENTIALID(),
            "productId" uniqueidentifier NOT NULL,
            "tenantId" uniqueidentifier NOT NULL,
            "movementType" nvarchar(20) NOT NULL,
            "quantity" decimal(18,2) NOT NULL,
            "unitPrice" decimal(18,2) NOT NULL,
            "referenceId" uniqueidentifier,
            "notes" nvarchar(1000),
            "createdBy" uniqueidentifier NOT NULL,
            "createdAt" datetime2 NOT NULL CONSTRAINT "DF_f38d3033b7f70b32431f84c8b83" DEFAULT getdate(),
            CONSTRAINT "PK_57a26b190618550d8e65fb860e7" PRIMARY KEY ("id")
        )`);
        
        const firstProduct = await queryRunner.query(`SELECT TOP 1 "id" FROM "products" ORDER BY "createdAt" ASC`);
        const firstTenantForStock = await queryRunner.query(`SELECT TOP 1 "id" FROM "tenants" ORDER BY "createdAt" ASC`);
        const firstUserForStock = await queryRunner.query(`SELECT TOP 1 "id" FROM "users" ORDER BY "createdAt" ASC`);
        const defaultProductId = firstProduct.length > 0 ? firstProduct[0].id : null;
        const defaultTenantIdForStock = firstTenantForStock.length > 0 ? firstTenantForStock[0].id : null;
        const defaultUserIdForStock = firstUserForStock.length > 0 ? firstUserForStock[0].id : null;
        
        if (defaultProductId && defaultTenantIdForStock && defaultUserIdForStock) {
            await queryRunner.query(`INSERT INTO "stock_movements" ("id", "productId", "tenantId", "movementType", "quantity", "unitPrice", "referenceId", "notes", "createdBy", "createdAt")
                SELECT 
                    CAST("id" AS uniqueidentifier),
                    COALESCE(
                        (SELECT TOP 1 "id" FROM "products" WHERE CAST("id" AS varchar(36)) = "temp_stock_movements"."productId"),
                        '${defaultProductId}'
                    ),
                    COALESCE(
                        (SELECT TOP 1 "id" FROM "tenants" WHERE CAST("id" AS varchar(36)) = "temp_stock_movements"."tenantId"),
                        '${defaultTenantIdForStock}'
                    ),
                    "movementType",
                    "quantity",
                    "unitPrice",
                    CASE WHEN "referenceId" IS NOT NULL AND EXISTS (SELECT 1 FROM "sales" WHERE CAST("id" AS varchar(36)) = "temp_stock_movements"."referenceId") THEN 
                        (SELECT TOP 1 "id" FROM "sales" WHERE CAST("id" AS varchar(36)) = "temp_stock_movements"."referenceId")
                    ELSE NULL END,
                    "notes",
                    COALESCE(
                        (SELECT TOP 1 "id" FROM "users" WHERE CAST("id" AS varchar(36)) = "temp_stock_movements"."createdBy"),
                        '${defaultUserIdForStock}'
                    ),
                    CAST("createdAt" AS datetime2)
                FROM "temp_stock_movements"`);
        } else {
            throw new Error('No product, tenant or user found to map stock_movements');
        }
        await queryRunner.query(`DROP TABLE "temp_stock_movements"`);
        await queryRunner.query(`CREATE INDEX "IDX_fe8f81647152d8bfb9c7c4e490" ON "stock_movements" ("productId", "createdAt")`);

        // ============================================
        // Step 9: Migrate sales (depends on tenants, users)
        // ============================================
        const salesPK = await queryRunner.query(`
            SELECT name FROM sys.key_constraints 
            WHERE type = 'PK' AND parent_object_id = OBJECT_ID('sales')
        `);
        if (salesPK.length > 0) {
            await queryRunner.query(`ALTER TABLE "sales" DROP CONSTRAINT "${salesPK[0].name}"`);
        }

        await queryRunner.query(`CREATE TABLE "temp_sales" (
            "id" varchar(36) NOT NULL,
            "tenantId" varchar(36) NOT NULL,
            "saleNumber" nvarchar(50) NOT NULL,
            "totalAmount" decimal(18,2) NOT NULL,
            "discountAmount" decimal(18,2) NOT NULL,
            "finalAmount" decimal(18,2) NOT NULL,
            "paymentMethod" nvarchar(20) NOT NULL,
            "cashierId" varchar(36) NOT NULL,
            "createdAt" datetime NOT NULL
        )`);
        await queryRunner.query(`INSERT INTO "temp_sales" SELECT "id", "tenantId", "saleNumber", "totalAmount", "discountAmount", "finalAmount", "paymentMethod", "cashierId", "createdAt" FROM "sales"`);
        await queryRunner.query(`DROP TABLE "sales"`);
        await queryRunner.query(`CREATE TABLE "sales" (
            "id" uniqueidentifier NOT NULL CONSTRAINT "DF_4f0bc990ae81dba46da680895ea" DEFAULT NEWSEQUENTIALID(),
            "tenantId" uniqueidentifier NOT NULL,
            "saleNumber" nvarchar(50) NOT NULL,
            "totalAmount" decimal(18,2) NOT NULL,
            "discountAmount" decimal(18,2) NOT NULL DEFAULT (0),
            "finalAmount" decimal(18,2) NOT NULL,
            "paymentMethod" nvarchar(20) NOT NULL,
            "cashierId" uniqueidentifier NOT NULL,
            "createdAt" datetime2 NOT NULL CONSTRAINT "DF_f83303ecd8a5d50818506216dac" DEFAULT getdate(),
            CONSTRAINT "PK_4f0bc990ae81dba46da680895ea" PRIMARY KEY ("id")
        )`);
        
        const firstTenantForSales = await queryRunner.query(`SELECT TOP 1 "id" FROM "tenants" ORDER BY "createdAt" ASC`);
        const firstUserForSales = await queryRunner.query(`SELECT TOP 1 "id" FROM "users" ORDER BY "createdAt" ASC`);
        const defaultTenantIdForSales = firstTenantForSales.length > 0 ? firstTenantForSales[0].id : null;
        const defaultUserIdForSales = firstUserForSales.length > 0 ? firstUserForSales[0].id : null;
        
        if (defaultTenantIdForSales && defaultUserIdForSales) {
            await queryRunner.query(`INSERT INTO "sales" ("id", "tenantId", "saleNumber", "totalAmount", "discountAmount", "finalAmount", "paymentMethod", "cashierId", "createdAt")
                SELECT 
                    CAST("id" AS uniqueidentifier),
                    COALESCE(
                        (SELECT TOP 1 "id" FROM "tenants" WHERE CAST("id" AS varchar(36)) = "temp_sales"."tenantId"),
                        '${defaultTenantIdForSales}'
                    ),
                    "saleNumber",
                    "totalAmount",
                    "discountAmount",
                    "finalAmount",
                    "paymentMethod",
                    COALESCE(
                        (SELECT TOP 1 "id" FROM "users" WHERE CAST("id" AS varchar(36)) = "temp_sales"."cashierId"),
                        '${defaultUserIdForSales}'
                    ),
                    CAST("createdAt" AS datetime2)
                FROM "temp_sales"`);
        } else {
            throw new Error('No tenant or user found to map sales');
        }
        await queryRunner.query(`DROP TABLE "temp_sales"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e96ec22f56c541a81549f653f1" ON "sales" ("saleNumber", "tenantId")`);

        // ============================================
        // Step 10: Migrate sale_items (depends on sales, products)
        // ============================================
        const saleItemsPK = await queryRunner.query(`
            SELECT name FROM sys.key_constraints 
            WHERE type = 'PK' AND parent_object_id = OBJECT_ID('sale_items')
        `);
        if (saleItemsPK.length > 0) {
            await queryRunner.query(`ALTER TABLE "sale_items" DROP CONSTRAINT "${saleItemsPK[0].name}"`);
        }

        await queryRunner.query(`CREATE TABLE "temp_sale_items" (
            "id" varchar(36) NOT NULL,
            "saleId" varchar(36) NOT NULL,
            "productId" varchar(36) NOT NULL,
            "quantity" decimal(18,2) NOT NULL,
            "unitPrice" decimal(18,2) NOT NULL,
            "discountAmount" decimal(18,2) NOT NULL,
            "lineTotal" decimal(18,2) NOT NULL
        )`);
        await queryRunner.query(`INSERT INTO "temp_sale_items" SELECT "id", "saleId", "productId", "quantity", "unitPrice", "discountAmount", "lineTotal" FROM "sale_items"`);
        await queryRunner.query(`DROP TABLE "sale_items"`);
        await queryRunner.query(`CREATE TABLE "sale_items" (
            "id" uniqueidentifier NOT NULL CONSTRAINT "DF_5a7dc5b4562a9e590528b3e08ab" DEFAULT NEWSEQUENTIALID(),
            "saleId" uniqueidentifier NOT NULL,
            "productId" uniqueidentifier NOT NULL,
            "quantity" decimal(18,2) NOT NULL,
            "unitPrice" decimal(18,2) NOT NULL,
            "discountAmount" decimal(18,2) NOT NULL DEFAULT (0),
            "lineTotal" decimal(18,2) NOT NULL,
            CONSTRAINT "PK_5a7dc5b4562a9e590528b3e08ab" PRIMARY KEY ("id")
        )`);
        
        const firstSale = await queryRunner.query(`SELECT TOP 1 "id" FROM "sales" ORDER BY "createdAt" ASC`);
        const firstProductForSaleItems = await queryRunner.query(`SELECT TOP 1 "id" FROM "products" ORDER BY "createdAt" ASC`);
        const defaultSaleId = firstSale.length > 0 ? firstSale[0].id : null;
        const defaultProductIdForSaleItems = firstProductForSaleItems.length > 0 ? firstProductForSaleItems[0].id : null;
        
        if (defaultSaleId && defaultProductIdForSaleItems) {
            await queryRunner.query(`INSERT INTO "sale_items" ("id", "saleId", "productId", "quantity", "unitPrice", "discountAmount", "lineTotal")
                SELECT 
                    CAST("id" AS uniqueidentifier),
                    COALESCE(
                        (SELECT TOP 1 "id" FROM "sales" WHERE CAST("id" AS varchar(36)) = "temp_sale_items"."saleId"),
                        '${defaultSaleId}'
                    ),
                    COALESCE(
                        (SELECT TOP 1 "id" FROM "products" WHERE CAST("id" AS varchar(36)) = "temp_sale_items"."productId"),
                        '${defaultProductIdForSaleItems}'
                    ),
                    "quantity",
                    "unitPrice",
                    "discountAmount",
                    "lineTotal"
                FROM "temp_sale_items"`);
        } else {
            throw new Error('No sale or product found to map sale_items');
        }
        await queryRunner.query(`DROP TABLE "temp_sale_items"`);

        // ============================================
        // Step 11: Recreate all foreign keys
        // ============================================
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_c58f7e88c286e5e3478960a998b" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_86033897c009fcca8b6505d6be2" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_46a85229c9953b2b94f768190b2" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_6804855ba1a19523ea57e0769b4" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_a3acb59db67e977be45e382fc56" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_7dde280faf0d06b5b1b067b8ac1" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_84145471dd808c370c12861afca" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_items" ADD CONSTRAINT "FK_c642be08de5235317d4cf3deb40" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_items" ADD CONSTRAINT "FK_d675aea38a16313e844662c48f8" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales" ADD CONSTRAINT "FK_37606c7b1560c6be428c7a48959" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales" ADD CONSTRAINT "FK_3b04a33c33ed9653a8a3cd316c5" FOREIGN KEY ("cashierId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverse migration: Convert uniqueidentifier back to varchar and datetime2 to datetime
        // This is a complex operation and should be done carefully
        // For now, we'll implement a basic version
        
        // Drop foreign keys
        await queryRunner.query(`ALTER TABLE "sales" DROP CONSTRAINT "FK_3b04a33c33ed9653a8a3cd316c5"`);
        await queryRunner.query(`ALTER TABLE "sales" DROP CONSTRAINT "FK_37606c7b1560c6be428c7a48959"`);
        await queryRunner.query(`ALTER TABLE "sale_items" DROP CONSTRAINT "FK_d675aea38a16313e844662c48f8"`);
        await queryRunner.query(`ALTER TABLE "sale_items" DROP CONSTRAINT "FK_c642be08de5235317d4cf3deb40"`);
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_84145471dd808c370c12861afca"`);
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_7dde280faf0d06b5b1b067b8ac1"`);
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_a3acb59db67e977be45e382fc56"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_6804855ba1a19523ea57e0769b4"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_ff56834e735fa78a15d0cf21926"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_46a85229c9953b2b94f768190b2"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_86033897c009fcca8b6505d6be2"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_472b25323af01488f1f66a06b67"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_c58f7e88c286e5e3478960a998b"`);

        // Note: Full reverse migration would require converting all uniqueidentifier back to varchar
        // and datetime2 back to datetime. This is complex and data-loss prone.
        // In production, consider creating a new migration instead of using down().
        throw new Error('Reverse migration not fully implemented. Use a new migration to revert changes.');
    }
}
