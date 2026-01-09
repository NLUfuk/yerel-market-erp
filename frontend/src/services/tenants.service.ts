import apiClient from '../utils/api';
import {
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  ListTenantsParams,
  PaginatedTenantsResponse,
} from '../types/tenants';

/**
 * Tenants Service
 * Handles tenant management API calls
 * Only accessible by SuperAdmin
 */
class TenantsService {
  /**
   * Get tenants list with pagination and filters
   */
  async getTenants(params?: ListTenantsParams): Promise<PaginatedTenantsResponse> {
    const response = await apiClient.get<PaginatedTenantsResponse>('/tenants', {
      params,
    });
    return response.data;
  }

  /**
   * Get tenant by ID
   */
  async getTenant(id: string): Promise<Tenant> {
    const response = await apiClient.get<Tenant>(`/tenants/${id}`);
    return response.data;
  }

  /**
   * Create a new tenant
   */
  async createTenant(data: CreateTenantRequest): Promise<Tenant> {
    const response = await apiClient.post<Tenant>('/tenants', data);
    return response.data;
  }

  /**
   * Update an existing tenant
   */
  async updateTenant(id: string, data: UpdateTenantRequest): Promise<Tenant> {
    const response = await apiClient.put<Tenant>(`/tenants/${id}`, data);
    return response.data;
  }

  /**
   * Delete a tenant
   * Note: Backend endpoint needs to be implemented
   */
  async deleteTenant(id: string): Promise<void> {
    await apiClient.delete(`/tenants/${id}`);
  }
}

export const tenantsService = new TenantsService();
export default tenantsService;
