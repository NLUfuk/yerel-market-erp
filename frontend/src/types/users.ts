/**
 * Users Types
 */

import { PaginationParams, PaginatedResponse } from './products';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string | null;
  isActive: boolean;
  roles: string[] | Role[]; // Backend returns string[], but can also be Role[] for compatibility
  createdAt: string;
  updatedAt: string;
  tenant?: Tenant;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  assignedAt?: string;
  assignedBy?: string;
}

export interface Tenant {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId?: string | null;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  tenantId?: string | null;
  isActive?: boolean;
}

export interface AssignRoleRequest {
  roleId: string;
}

export interface ListUsersParams extends PaginationParams {
  role?: string;
  tenantId?: string;
  isActive?: boolean;
}

export interface PaginatedUsersResponse extends PaginatedResponse<User> {}
