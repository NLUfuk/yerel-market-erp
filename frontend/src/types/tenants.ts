/**
 * Tenants Types
 */

import { PaginationParams, PaginatedResponse } from './products';

export interface Tenant {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantRequest {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface UpdateTenantRequest {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface ListTenantsParams extends PaginationParams {
  isActive?: boolean;
}

export interface PaginatedTenantsResponse extends PaginatedResponse<Tenant> {}
