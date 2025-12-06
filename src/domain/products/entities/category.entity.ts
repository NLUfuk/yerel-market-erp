/**
 * Category Domain Entity
 */
export class Category {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly tenantId: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public description?: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Category name is required');
    }
    if (this.name.length > 255) {
      throw new Error('Category name must be less than 255 characters');
    }
    if (!this.tenantId || this.tenantId.trim().length === 0) {
      throw new Error('Tenant ID is required');
    }
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Category name is required');
    }
    this.name = name;
    this.updatedAt = new Date();
  }

  updateDescription(description?: string): void {
    this.description = description;
    this.updatedAt = new Date();
  }
}

