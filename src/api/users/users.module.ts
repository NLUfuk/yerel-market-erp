import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { CreateUserUseCase } from '../../application/users/use-cases/create-user.usecase';
import { UpdateUserUseCase } from '../../application/users/use-cases/update-user.usecase';
import { ListUsersUseCase } from '../../application/users/use-cases/list-users.usecase';
import { AssignRoleUseCase } from '../../application/users/use-cases/assign-role.usecase';
import { UserRepository } from '../../infrastructure/persistence/typeorm/repositories/user.typeorm-repo';
import { RoleRepository } from '../../infrastructure/persistence/typeorm/repositories/user.typeorm-repo';
import { UserRoleRepository } from '../../infrastructure/persistence/typeorm/repositories/user.typeorm-repo';
import { UserEntity } from '../../infrastructure/persistence/typeorm/entities/user.typeorm-entity';
import { RoleEntity } from '../../infrastructure/persistence/typeorm/entities/role.typeorm-entity';
import { UserRoleEntity } from '../../infrastructure/persistence/typeorm/entities/user-role.typeorm-entity';

/**
 * Users Module
 * Handles user management
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RoleEntity, UserRoleEntity]),
  ],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    UpdateUserUseCase,
    ListUsersUseCase,
    AssignRoleUseCase,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
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
  exports: ['IUserRepository', 'IRoleRepository', 'IUserRoleRepository'],
})
export class UsersModule {}

