import apiClient from '../utils/api';
import { LoginRequest, RegisterTenantRequest, AuthResponse, User } from '../types/auth';

/**
 * Auth Service
 * Handles authentication API calls
 */
class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  /**
   * Register new tenant
   */
  async registerTenant(data: RegisterTenantRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register-tenant', data);
    return response.data;
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Get auth token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.roles.includes(role);
  }

  /**
   * Check if user is SuperAdmin
   */
  isSuperAdmin(): boolean {
    return this.hasRole('SuperAdmin');
  }

  /**
   * Check if user is TenantAdmin
   */
  isTenantAdmin(): boolean {
    return this.hasRole('TenantAdmin');
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Save auth data to localStorage
   */
  saveAuthData(authResponse: AuthResponse): void {
    localStorage.setItem('token', authResponse.accessToken);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
  }
}

export const authService = new AuthService();
export default authService;

