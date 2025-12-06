import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getAuthConfig } from '../../infrastructure/config/auth.config';
import { AuthController } from './auth.controller';
import { LoginUseCase } from '../../application/auth/use-cases/login.usecase';
import { RegisterTenantUseCase } from '../../application/auth/use-cases/register-tenant.usecase';
import { JwtStrategy } from '../../infrastructure/security/jwt.strategy';
import { UserRepository } from '../../infrastructure/persistence/typeorm/repositories/user.typeorm-repo';
import { TenantRepository } from '../../infrastructure/persistence/typeorm/repositories/tenant.typeorm-repo';
import { RoleRepository } from '../../infrastructure/persistence/typeorm/repositories/user.typeorm-repo';
import { UserRoleRepository } from '../../infrastructure/persistence/typeorm/repositories/user.typeorm-repo';
import { UserEntity } from '../../infrastructure/persistence/typeorm/entities/user.typeorm-entity';
import { TenantEntity } from '../../infrastructure/persistence/typeorm/entities/tenant.typeorm-entity';
import { RoleEntity } from '../../infrastructure/persistence/typeorm/entities/role.typeorm-entity';
import { UserRoleEntity } from '../../infrastructure/persistence/typeorm/entities/user-role.typeorm-entity';

/**
 * Auth Module
 * Handles authentication and authorization
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: getAuthConfig().jwtSecret,
      signOptions: { expiresIn: getAuthConfig().jwtExpiresIn },
    } as any),
    TypeOrmModule.forFeature([
      UserEntity,
      TenantEntity,
      RoleEntity,
      UserRoleEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    LoginUseCase,
    RegisterTenantUseCase,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'ITenantRepository',
      useClass: TenantRepository,
    },
    {
      provide: 'IRoleRepository',
      useClass: RoleRepository,
    },
    {
      provide: 'IUserRoleRepository',
      useClass: UserRoleRepository,
    },
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}

