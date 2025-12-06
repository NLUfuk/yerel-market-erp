import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { SaleResponseDto } from '../dto/sale-response.dto';
import type { IProductRepository } from '../../../domain/products/repositories/product.repository';
import type { ISaleRepository } from '../../../domain/sales/repositories/sale.repository';
import type { IStockMovementRepository } from '../../../domain/sales/repositories/sale.repository';
import { Sale, PaymentMethod } from '../../../domain/sales/entities/sale.entity';
import { SaleItem } from '../../../domain/sales/entities/sale-item.entity';
import { StockMovement, StockMovementType } from '../../../domain/sales/entities/stock-movement.entity';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Create Sale Use Case
 * Creates a sale and updates product stock
 */
@Injectable()
export class CreateSaleUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('ISaleRepository')
    private readonly saleRepository: ISaleRepository,
    @Inject('IStockMovementRepository')
    private readonly stockMovementRepository: IStockMovementRepository,
  ) {}

  async execute(
    dto: CreateSaleDto,
    currentUser: RequestUser,
  ): Promise<SaleResponseDto> {
    const tenantId = currentUser.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is required to create sales');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Sale must have at least one item');
    }

    // Validate products and create sale items
    const saleItems: SaleItem[] = [];
    const productIds = dto.items.map((item) => item.productId);

    for (const itemDto of dto.items) {
      const product = await this.productRepository.findById(itemDto.productId);
      if (!product) {
        throw new NotFoundException(
          `Product with ID "${itemDto.productId}" not found`,
        );
      }

      // Check tenant access
      if (product.tenantId !== tenantId) {
        throw new ForbiddenException(
          `Product "${product.name}" does not belong to your tenant`,
        );
      }

      // Check stock availability
      if (product.stockQuantity < itemDto.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product "${product.name}". Available: ${product.stockQuantity}, Requested: ${itemDto.quantity}`,
        );
      }

      // Check if product is active
      if (!product.isActive) {
        throw new BadRequestException(`Product "${product.name}" is not active`);
      }

      // Create sale item
      const saleItemId = uuidv4();
      const saleItem = SaleItem.create(
        saleItemId,
        '', // saleId will be set after sale creation
        itemDto.productId,
        itemDto.quantity,
        itemDto.unitPrice,
        itemDto.discountAmount || 0,
      );
      saleItems.push(saleItem);
    }

    // Generate sale number (format: SALE-YYYYMMDD-XXX)
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    let saleNumber = `SALE-${dateStr}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`;

    // Check if sale number already exists (unlikely but possible)
    let existingSale = await this.saleRepository.findBySaleNumber(
      saleNumber,
      tenantId,
    );
    let attempts = 0;
    while (existingSale && attempts < 10) {
      saleNumber = `SALE-${dateStr}-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')}`;
      existingSale = await this.saleRepository.findBySaleNumber(
        saleNumber,
        tenantId,
      );
      attempts++;
    }

    // If still exists after retries, use UUID suffix
    if (existingSale) {
      saleNumber = `SALE-${dateStr}-${uuidv4().substring(0, 8).toUpperCase()}`;
    }

    // Create sale items with sale ID (will be set after sale creation)
    const saleId = uuidv4();
    const finalSaleItems = saleItems.map((item) =>
      SaleItem.create(
        item.id,
        saleId,
        item.productId,
        item.quantity,
        item.unitPrice,
        item.discountAmount,
      ),
    );

    // Create sale
    const sale = Sale.create(
      saleId,
      tenantId,
      saleNumber,
      finalSaleItems,
      dto.paymentMethod,
      currentUser.userId,
      dto.discountAmount || 0,
    );

    // Save sale
    const savedSale = await this.saleRepository.save(sale);

    // Update product stock and create stock movements
    for (let i = 0; i < dto.items.length; i++) {
      const itemDto = dto.items[i];
      const product = await this.productRepository.findById(itemDto.productId);
      if (!product) continue;

      // Decrease stock
      product.decreaseStock(itemDto.quantity);

      // Create stock movement
      const movementId = uuidv4();
      const movement = new StockMovement(
        movementId,
        itemDto.productId,
        tenantId,
        StockMovementType.SALE,
        -itemDto.quantity, // Negative for sale
        itemDto.unitPrice,
        currentUser.userId,
        new Date(),
        saleId,
        `Sale ${saleNumber}`,
      );

      await this.productRepository.update(product);
      await this.stockMovementRepository.save(movement);
    }

    // Reload sale with items
    const saleWithItems = await this.saleRepository.findById(saleId);
    if (!saleWithItems) {
      throw new Error('Failed to load sale after creation');
    }

    // Get product names for response
    const productNames: Record<string, string> = {};
    for (const itemDto of dto.items) {
      const product = await this.productRepository.findById(itemDto.productId);
      if (product) {
        productNames[itemDto.productId] = product.name;
      }
    }

    return {
      id: saleWithItems.id,
      tenantId: saleWithItems.tenantId,
      saleNumber: saleWithItems.saleNumber,
      totalAmount: saleWithItems.totalAmount,
      discountAmount: saleWithItems.discountAmount,
      finalAmount: saleWithItems.finalAmount,
      paymentMethod: saleWithItems.paymentMethod,
      cashierId: saleWithItems.cashierId,
      items: saleWithItems.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: productNames[item.productId],
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: item.discountAmount,
        lineTotal: item.lineTotal,
      })),
      createdAt: saleWithItems.createdAt,
    };
  }
}

