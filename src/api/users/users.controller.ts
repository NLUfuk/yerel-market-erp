import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateUserDto } from '../../application/users/dto/create-user.dto';
import { UpdateUserDto } from '../../application/users/dto/update-user.dto';
import { AssignRoleDto } from '../../application/users/dto/assign-role.dto';
import { UserResponseDto } from '../../application/users/dto/user-response.dto';
import { PaginationDto } from '../../application/shared/dto/pagination.dto';
import { CreateUserUseCase } from '../../application/users/use-cases/create-user.usecase';
import { UpdateUserUseCase } from '../../application/users/use-cases/update-user.usecase';
import { ListUsersUseCase } from '../../application/users/use-cases/list-users.usecase';
import { AssignRoleUseCase } from '../../application/users/use-cases/assign-role.usecase';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { CurrentUser } from '../../infrastructure/security/decorators/current-user.decorator';
import type { RequestUser } from '../../infrastructure/security/jwt.strategy';

/**
 * Users Controller
 * Handles user management endpoints
 * SuperAdmin: All users
 * TenantAdmin: Own tenant users
 * Protected by global JwtAuthGuard and RolesGuard
 */
@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@Roles('SuperAdmin', 'TenantAdmin')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly assignRoleUseCase: AssignRoleUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async create(
    @Body() createDto: CreateUserDto,
    @CurrentUser() user: RequestUser,
  ): Promise<UserResponseDto> {
    return this.createUserUseCase.execute(createDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List users' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
  })
  async list(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.listUsersUseCase.execute(pagination, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto,
    @CurrentUser() user: RequestUser,
  ): Promise<UserResponseDto> {
    return this.updateUserUseCase.execute(id, updateDto, user);
  }

  @Post(':id/roles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({
    status: 200,
    description: 'Role assigned successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  @ApiResponse({ status: 409, description: 'User already has this role' })
  async assignRole(
    @Param('id') id: string,
    @Body() assignRoleDto: AssignRoleDto,
    @CurrentUser() user: RequestUser,
  ): Promise<UserResponseDto> {
    return this.assignRoleUseCase.execute(id, assignRoleDto, user);
  }
}

