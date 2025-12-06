/**
 * Stock Movement Type Enum
 */
export enum StockMovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
}

/**
 * StockMovement Domain Entity
 */
export class StockMovement {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly tenantId: string,
    public movementType: StockMovementType,
    public quantity: number,
    public unitPrice: number,
    public readonly createdBy: string,
    public readonly createdAt: Date = new Date(),
    public referenceId?: string, // Sale.id or Purchase.id
    public notes?: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.productId || this.productId.trim().length === 0) {
      throw new Error('Product ID is required');
    }
    if (!this.tenantId || this.tenantId.trim().length === 0) {
      throw new Error('Tenant ID is required');
    }
    if (!Object.values(StockMovementType).includes(this.movementType)) {
      throw new Error('Invalid movement type');
    }
    if (this.quantity === 0) {
      throw new Error('Quantity cannot be zero');
    }
    if (this.unitPrice < 0) {
      throw new Error('Unit price cannot be negative');
    }
    if (!this.createdBy || this.createdBy.trim().length === 0) {
      throw new Error('Created by user ID is required');
    }
  }

  isIncrease(): boolean {
    return (
      this.movementType === StockMovementType.PURCHASE ||
      this.movementType === StockMovementType.RETURN
    );
  }

  isDecrease(): boolean {
    return (
      this.movementType === StockMovementType.SALE ||
      this.movementType === StockMovementType.ADJUSTMENT
    );
  }

  getEffectiveQuantity(): number {
    return this.isIncrease() ? Math.abs(this.quantity) : -Math.abs(this.quantity);
  }
}

