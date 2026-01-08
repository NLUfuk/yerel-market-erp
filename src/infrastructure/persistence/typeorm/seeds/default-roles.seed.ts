import { DataSource } from 'typeorm';
import { RoleEntity } from '../entities/role.typeorm-entity';
import { RoleName } from '../../../../domain/users/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../entities/user.typeorm-entity';
import { UserRoleEntity } from '../entities/user-role.typeorm-entity';
import { seedDemoData } from './demo-data.seed';
import { randomUUID } from 'crypto';

/**
 * Seed default roles
 */
export async function seedDefaultRoles(dataSource: DataSource): Promise<void> {
  const roleRepository = dataSource.getRepository(RoleEntity);

  const roles = [
    { name: RoleName.SUPER_ADMIN, description: 'System administrator with full access' },
    { name: RoleName.TENANT_ADMIN, description: 'Tenant administrator with full tenant access' },
    { name: RoleName.CASHIER, description: 'Cashier with sales permissions' },
    { name: RoleName.VIEWER, description: 'Viewer with read-only access' },
  ];

  for (const roleData of roles) {
    const existingRole = await roleRepository.findOneBy({ name: roleData.name });
    if (!existingRole) {
      // SQL Server'da varchar UUID için raw SQL kullan
      const roleId = randomUUID();
      await dataSource.query(
        `INSERT INTO "roles"("id", "name", "description", "createdAt") VALUES (@0, @1, @2, GETDATE())`,
        [roleId, roleData.name, roleData.description]
      );
      console.log(`✅ Created role: ${roleData.name}`);
    } else {
      console.log(`⏭️  Role already exists: ${roleData.name}`);
    }
  }
}

/**
 * Seed first SuperAdmin user
 * Email: admin@localgroceryhub.com
 * Password: Admin123! (change in production)
 */
export async function seedSuperAdmin(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(UserEntity);
  const roleRepository = dataSource.getRepository(RoleEntity);
  const userRoleRepository = dataSource.getRepository(UserRoleEntity);

  const superAdminEmail = 'admin@localgroceryhub.com';
  const existingAdmin = await userRepository.findOneBy({ email: superAdminEmail });

  if (existingAdmin) {
    console.log(`⏭️  SuperAdmin already exists: ${superAdminEmail}`);
    return;
  }

  // Get SuperAdmin role
  const superAdminRole = await roleRepository.findOneBy({ name: RoleName.SUPER_ADMIN });
  if (!superAdminRole) {
    throw new Error('SuperAdmin role not found. Please run seedDefaultRoles first.');
  }

  // Create SuperAdmin user
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  // SQL Server'da varchar UUID için raw SQL kullan
  const adminId = randomUUID();
  await dataSource.query(
    `INSERT INTO "users"("id", "email", "passwordHash", "firstName", "lastName", "tenantId", "isActive", "createdAt", "updatedAt") VALUES (@0, @1, @2, @3, @4, NULL, 1, GETDATE(), GETDATE())`,
    [adminId, superAdminEmail, passwordHash, 'Super', 'Admin']
  );
  const savedAdmin = await userRepository.findOneBy({ id: adminId });
  if (!savedAdmin) {
    throw new Error('Failed to create SuperAdmin user');
  }
  console.log(`✅ Created SuperAdmin: ${superAdminEmail}`);

  // Assign SuperAdmin role
  const userRole = userRoleRepository.create({
    userId: savedAdmin.id,
    roleId: superAdminRole.id,
    assignedBy: savedAdmin.id, // Self-assigned
  });

  await userRoleRepository.save(userRole);
  console.log(`✅ Assigned SuperAdmin role to ${superAdminEmail}`);
}

/**
 * Main seed function
 */
export async function runSeeds(dataSource: DataSource, includeDemoData: boolean = false): Promise<void> {
  console.log('🌱 Starting database seeding...');
  
  try {
    await seedDefaultRoles(dataSource);
    await seedSuperAdmin(dataSource);
    
    if (includeDemoData) {
      console.log('\n📦 Seeding demo data...');
      await seedDemoData(dataSource);
    }
    
    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

