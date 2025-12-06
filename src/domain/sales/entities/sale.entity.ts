import { SaleItem } from './sale-item.entity';

/**
 * Payment Method Enum
 */
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  MIXED = 'MIXED',
}

/**
 * Sale Domain Entity
 */
export class Sale {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public saleNumber: string,
    public totalAmount: number,
    public discountAmount: number = 0,
    public finalAmount: number,
    public paymentMethod: PaymentMethod,
    public readonly cashierId: string,
    public readonly createdAt: Date = new Date(),
    public items: SaleItem[] = [],
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.tenantId || this.tenantId.trim().length === 0) {
      throw new Error('Tenant ID is required');
    }
    if (!this.saleNumber || this.saleNumber.trim().length === 0) {
      throw new Error('Sale number is required');
    }
    if (this.totalAmount < 0) {
      throw new Error('Total amount cannot be negative');
    }
    if (this.discountAmount < 0) {
      throw new Error('Discount amount cannot be negative');
    }
    if (this.discountAmount > this.totalAmount) {
      throw new Error('Discount cannot exceed total amount');
    }
    if (this.finalAmount < 0) {
      throw new Error('Final amount cannot be negative');
    }
    if (!Object.values(PaymentMethod).includes(this.paymentMethod)) {
      throw new Error('Invalid payment method');
    }
    if (!this.cashierId || this.cashierId.trim().length === 0) {
      throw new Error('Cashier ID is required');
    }
    if (this.items.length === 0) {
      throw new Error('Sale must have at least one item');
    }
  }

  addItem(item: SaleItem): void {
    this.items.push(item);
    this.recalculateTotals();
  }

  removeItem(itemId: string): void {
    this.items = this.items.filter((item) => item.id !== itemId);
    this.recalculateTotals();
  }

  updateDiscount(discountAmount: number): void {
    if (discountAmount < 0) {
      throw new Error('Discount amount cannot be negative');
    }
    if (discountAmount > this.totalAmount) {
      throw new Error('Discount cannot exceed total amount');
    }
    this.discountAmount = discountAmount;
    this.recalculateTotals();
  }

  private recalculateTotals(): void {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.lineTotal, 0);
    this.finalAmount = this.totalAmount - this.discountAmount;
  }

  static create(
    id: string,
    tenantId: string,
    saleNumber: string,
    items: SaleItem[],
    paymentMethod: PaymentMethod,
    cashierId: string,
    discountAmount: number = 0,
  ): Sale {
    const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const finalAmount = totalAmount - discountAmount;

    return new Sale(
      id,
      tenantId,
      saleNumber,
      totalAmount,
      discountAmount,
      finalAmount,
      paymentMethod,
      cashierId,
      new Date(),
      items,
    );
  }
}

