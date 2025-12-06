/**
 * Product Domain Entity
 */
export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public sku: string,
    public readonly categoryId: string,
    public readonly tenantId: string,
    public unitPrice: number,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public barcode?: string,
    public costPrice?: number,
    public stockQuantity: number = 0,
    public minStockLevel: number = 0,
    public isActive: boolean = true,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Product name is required');
    }
    if (!this.sku || this.sku.trim().length === 0) {
      throw new Error('SKU is required');
    }
    if (!this.categoryId || this.categoryId.trim().length === 0) {
      throw new Error('Category ID is required');
    }
    if (!this.tenantId || this.tenantId.trim().length === 0) {
      throw new Error('Tenant ID is required');
    }
    if (this.unitPrice < 0) {
      throw new Error('Unit price cannot be negative');
    }
    if (this.costPrice !== undefined && this.costPrice < 0) {
      throw new Error('Cost price cannot be negative');
    }
    if (this.stockQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }
    if (this.minStockLevel < 0) {
      throw new Error('Min stock level cannot be negative');
    }
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Product name is required');
    }
    this.name = name;
    this.updatedAt = new Date();
  }

  updateSku(sku: string): void {
    if (!sku || sku.trim().length === 0) {
      throw new Error('SKU is required');
    }
    this.sku = sku;
    this.updatedAt = new Date();
  }

  updateBarcode(barcode?: string): void {
    this.barcode = barcode;
    this.updatedAt = new Date();
  }

  updatePricing(unitPrice: number, costPrice?: number): void {
    if (unitPrice < 0) {
      throw new Error('Unit price cannot be negative');
    }
    if (costPrice !== undefined && costPrice < 0) {
      throw new Error('Cost price cannot be negative');
    }
    this.unitPrice = unitPrice;
    this.costPrice = costPrice;
    this.updatedAt = new Date();
  }

  updateStock(quantity: number): void {
    if (quantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }
    this.stockQuantity = quantity;
    this.updatedAt = new Date();
  }

  increaseStock(quantity: number): void {
    if (quantity < 0) {
      throw new Error('Quantity to add cannot be negative');
    }
    this.stockQuantity += quantity;
    this.updatedAt = new Date();
  }

  decreaseStock(quantity: number): void {
    if (quantity < 0) {
      throw new Error('Quantity to remove cannot be negative');
    }
    if (this.stockQuantity < quantity) {
      throw new Error('Insufficient stock');
    }
    this.stockQuantity -= quantity;
    this.updatedAt = new Date();
  }

  updateMinStockLevel(level: number): void {
    if (level < 0) {
      throw new Error('Min stock level cannot be negative');
    }
    this.minStockLevel = level;
    this.updatedAt = new Date();
  }

  isLowStock(): boolean {
    return this.stockQuantity <= this.minStockLevel;
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

