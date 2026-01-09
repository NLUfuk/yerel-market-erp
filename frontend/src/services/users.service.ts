import apiClient from '../utils/api';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  AssignRoleRequest,
  ListUsersParams,
  PaginatedUsersResponse,
} from '../types/users';

/**
 * Users Service
 * Handles user management API calls
 */
class UsersService {
  /**
   * Get users list with pagination and filters
   */
  async getUsers(params?: ListUsersParams): Promise<PaginatedUsersResponse> {
    const response = await apiClient.get<PaginatedUsersResponse>('/users', {
      params,
    });
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUser(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleId: string): Promise<User> {
    const response = await apiClient.post<User>(`/users/${userId}/roles`, {
      roleId,
    });
    return response.data;
  }
}

export const usersService = new UsersService();
export default usersService;
