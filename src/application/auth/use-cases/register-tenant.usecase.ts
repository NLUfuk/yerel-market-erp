import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RegisterTenantDto } from '../dto/register-tenant.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import type { ITenantRepository } from '../../../domain/tenants/repositories/tenant.repository';
import type { IUserRepository } from '../../../domain/users/repositories/user.repository';
import type { IRoleRepository } from '../../../domain/users/repositories/user.repository';
import type { IUserRoleRepository } from '../../../domain/users/repositories/user.repository';
import { Tenant } from '../../../domain/tenants/entities/tenant.entity';
import { User } from '../../../domain/users/entities/user.entity';
import { UserRole } from '../../../domain/users/entities/user-role.entity';
import { RoleName } from '../../../domain/users/entities/role.entity';
import { getAuthConfig } from '../../../infrastructure/config/auth.config';
import { JwtPayload } from '../../../infrastructure/security/jwt.strategy';

/**
 * Register Tenant Use Case
 * Creates a new tenant and its admin user
 */
@Injectable()
export class RegisterTenantUseCase {
  constructor(
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('IUserRoleRepository')
    private readonly userRoleRepository: IUserRoleRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: RegisterTenantDto): Promise<AuthResponseDto> {
    // Check if tenant name already exists
    const existingTenant = await this.tenantRepository.findByName(dto.name);
    if (existingTenant) {
      throw new ConflictException(`Tenant with name "${dto.name}" already exists`);
    }

    // Check if admin email already exists
    const existingUser = await this.userRepository.findByEmail(dto.adminEmail);
    if (existingUser) {
      throw new ConflictException(`User with email "${dto.adminEmail}" already exists`);
    }

    // Get TenantAdmin role
    const tenantAdminRole = await this.roleRepository.findByName(RoleName.TENANT_ADMIN);
    if (!tenantAdminRole) {
      throw new Error('TenantAdmin role not found. Please run database seeding first.');
    }

    // Create tenant
    const tenantId = uuidv4();
    const tenant = new Tenant(
      tenantId,
      dto.name,
      dto.address,
      dto.phone,
      dto.email,
      true,
      new Date(),
      new Date(),
    );

    const savedTenant = await this.tenantRepository.save(tenant);

    // Create admin user
    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(dto.adminPassword, 10);
    const adminUser = new User(
      userId,
      dto.adminEmail,
      passwordHash,
      dto.adminFirstName,
      dto.adminLastName,
      savedTenant.id,
      true,
      new Date(),
      new Date(),
      [],
    );

    const savedUser = await this.userRepository.save(adminUser);

    // Assign TenantAdmin role
    const userRole = new UserRole(
      savedUser.id,
      tenantAdminRole.id,
      new Date(),
      savedUser.id, // Self-assigned
    );
    await this.userRoleRepository.save(userRole);

    // Reload user with roles
    const userWithRoles = await this.userRepository.findById(savedUser.id);
    if (!userWithRoles) {
      throw new Error('Failed to load user after creation');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: userWithRoles.id,
      email: userWithRoles.email,
      tenantId: userWithRoles.tenantId,
      roles: userWithRoles.roles.map((role) => role.name),
    };

    const config = getAuthConfig();
    const accessToken = this.jwtService.sign(payload as any, {
      expiresIn: config.jwtExpiresIn,
    } as any);

    return {
      accessToken,
      user: {
        id: userWithRoles.id,
        email: userWithRoles.email,
        firstName: userWithRoles.firstName,
        lastName: userWithRoles.lastName,
        tenantId: userWithRoles.tenantId,
        roles: userWithRoles.roles.map((role) => role.name),
      },
    };
  }
}

