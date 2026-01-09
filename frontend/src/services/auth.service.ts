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

  /**
   * Impersonate a user (SuperAdmin only)
   */
  async impersonate(userId: string): Promise<AuthResponse> {
    // Store original user and token before impersonating
    const originalUser = this.getCurrentUser();
    const originalToken = this.getToken();
    if (originalUser) {
      localStorage.setItem('originalUser', JSON.stringify(originalUser));
    }
    if (originalToken) {
      localStorage.setItem('originalToken', originalToken);
    }

    const response = await apiClient.post<AuthResponse>(`/auth/impersonate/${userId}`);
    const authResponse = response.data;
    this.saveAuthData(authResponse);
    return authResponse;
  }

  /**
   * Get original user (before impersonation)
   */
  getOriginalUser(): User | null {
    const originalUserStr = localStorage.getItem('originalUser');
    if (!originalUserStr) return null;
    try {
      return JSON.parse(originalUserStr);
    } catch {
      return null;
    }
  }

  /**
   * Get original token (before impersonation)
   */
  getOriginalToken(): string | null {
    return localStorage.getItem('originalToken');
  }

  /**
   * Check if currently impersonating
   */
  isImpersonating(): boolean {
    return !!this.getOriginalUser();
  }

  /**
   * Stop impersonating and restore original user session
   */
  stopImpersonating(): void {
    const originalUser = this.getOriginalUser();
    const originalToken = this.getOriginalToken();
    
    if (originalUser && originalToken) {
      // Restore original token and user
      localStorage.setItem('token', originalToken);
      localStorage.setItem('user', JSON.stringify(originalUser));
      // Clear impersonation data
      localStorage.removeItem('originalUser');
      localStorage.removeItem('originalToken');
    } else {
      // If no original data, just clear impersonation state
      localStorage.removeItem('originalUser');
      localStorage.removeItem('originalToken');
    }
  }
}

export const authService = new AuthService();
export default authService;

