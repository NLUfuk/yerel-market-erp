import { Role } from './role.entity';

/**
 * User Domain Entity
 */
export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
    public firstName: string,
    public lastName: string,
    public tenantId: string | null, // null for SuperAdmin
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public roles: Role[] = [],
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error('Valid email is required');
    }
    if (!this.passwordHash || this.passwordHash.length === 0) {
      throw new Error('Password hash is required');
    }
    if (!this.firstName || this.firstName.trim().length === 0) {
      throw new Error('First name is required');
    }
    if (!this.lastName || this.lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  updateName(firstName: string, lastName: string): void {
    if (!firstName || firstName.trim().length === 0) {
      throw new Error('First name is required');
    }
    if (!lastName || lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }
    this.firstName = firstName;
    this.lastName = lastName;
    this.updatedAt = new Date();
  }

  updateEmail(email: string): void {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Valid email is required');
    }
    this.email = email;
    this.updatedAt = new Date();
  }

  updatePassword(passwordHash: string): void {
    if (!passwordHash || passwordHash.length === 0) {
      throw new Error('Password hash is required');
    }
    this.passwordHash = passwordHash;
    this.updatedAt = new Date();
  }

  assignRole(role: Role): void {
    if (!this.roles.find((r) => r.id === role.id)) {
      this.roles.push(role);
      this.updatedAt = new Date();
    }
  }

  removeRole(roleId: string): void {
    this.roles = this.roles.filter((r) => r.id !== roleId);
    this.updatedAt = new Date();
  }

  hasRole(roleName: string): boolean {
    return this.roles.some((r) => r.name === roleName);
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  isSuperAdmin(): boolean {
    return this.hasRole('SuperAdmin');
  }
}

