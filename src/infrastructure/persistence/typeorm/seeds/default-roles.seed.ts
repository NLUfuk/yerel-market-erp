import { DataSource } from 'typeorm';
import { RoleEntity } from '../entities/role.typeorm-entity';
import { RoleName } from '../../../../domain/users/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../entities/user.typeorm-entity';
import { UserRoleEntity } from '../entities/user-role.typeorm-entity';
import { seedDemoData } from './demo-data.seed';

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
      const role = roleRepository.create({
        name: roleData.name,
        description: roleData.description,
      });
      await roleRepository.save(role);
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
  const superAdmin = userRepository.create({
    email: superAdminEmail,
    passwordHash,
    firstName: 'Super',
    lastName: 'Admin',
    tenantId: null as any, // SuperAdmin has no tenant
    isActive: true,
  });

  const savedAdmin = await userRepository.save(superAdmin);
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

