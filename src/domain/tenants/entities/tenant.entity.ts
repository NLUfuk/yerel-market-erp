/**
 * Tenant Domain Entity
 * Pure domain model without infrastructure concerns
 */
export class Tenant {
  constructor(
    public readonly id: string,
    public name: string,
    public address?: string,
    public phone?: string,
    public email?: string,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Tenant name is required');
    }
    if (this.name.length > 255) {
      throw new Error('Tenant name must be less than 255 characters');
    }
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Tenant name is required');
    }
    this.name = name;
    this.updatedAt = new Date();
  }

  updateContactInfo(address?: string, phone?: string, email?: string): void {
    this.address = address;
    this.phone = phone;
    this.email = email;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }
}

