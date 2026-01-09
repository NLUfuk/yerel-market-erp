/**
 * SaleItem Domain Entity
 */
export class SaleItem {
  constructor(
    public readonly id: string,
    public readonly saleId: string,
    public readonly productId: string,
    public quantity: number,
    public unitPrice: number,
    public discountAmount: number = 0,
    public lineTotal: number,
  ) {
    this.validate();
    this.recalculateLineTotal();
  }

  private validate(): void {
    // Validate saleId - check if it exists and is not empty
    if (!this.saleId) {
      throw new Error('Sale ID is required');
    }
    if (typeof this.saleId === 'string' && this.saleId.trim().length === 0) {
      throw new Error('Sale ID cannot be empty');
    }
    
    // Validate productId
    if (!this.productId) {
      throw new Error('Product ID is required');
    }
    if (typeof this.productId === 'string' && this.productId.trim().length === 0) {
      throw new Error('Product ID cannot be empty');
    }
    
    // Validate quantity
    if (this.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }
    
    // Validate unitPrice
    if (this.unitPrice < 0) {
      throw new Error('Unit price cannot be negative');
    }
    
    // Validate discountAmount
    if (this.discountAmount < 0) {
      throw new Error('Discount amount cannot be negative');
    }
  }

  updateQuantity(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }
    this.quantity = quantity;
    this.recalculateLineTotal();
  }

  updateUnitPrice(unitPrice: number): void {
    if (unitPrice < 0) {
      throw new Error('Unit price cannot be negative');
    }
    this.unitPrice = unitPrice;
    this.recalculateLineTotal();
  }

  updateDiscount(discountAmount: number): void {
    if (discountAmount < 0) {
      throw new Error('Discount amount cannot be negative');
    }
    const maxDiscount = this.quantity * this.unitPrice;
    if (discountAmount > maxDiscount) {
      throw new Error('Discount cannot exceed line total');
    }
    this.discountAmount = discountAmount;
    this.recalculateLineTotal();
  }

  private recalculateLineTotal(): void {
    const subtotal = this.quantity * this.unitPrice;
    this.lineTotal = subtotal - this.discountAmount;
  }

  static create(
    id: string,
    saleId: string,
    productId: string,
    quantity: number,
    unitPrice: number,
    discountAmount: number = 0,
  ): SaleItem {
    return new SaleItem(id, saleId, productId, quantity, unitPrice, discountAmount, 0);
  }
}

