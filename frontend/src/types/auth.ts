/**
 * Authentication Types
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterTenantRequest {
  tenantName: string;
  tenantAddress?: string;
  tenantPhone?: string;
  tenantEmail?: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId?: string;
  roles: string[];
}

export interface JwtPayload {
  userId: string;
  email: string;
  tenantId?: string;
  roles: string[];
}

