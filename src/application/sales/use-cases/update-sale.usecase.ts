import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UpdateSaleDto } from '../dto/update-sale.dto';
import { SaleResponseDto } from '../dto/sale-response.dto';
import type { IProductRepository } from '../../../domain/products/repositories/product.repository';
import type { ISaleRepository } from '../../../domain/sales/repositories/sale.repository';
import type { IStockMovementRepository } from '../../../domain/sales/repositories/sale.repository';
import { Sale } from '../../../domain/sales/entities/sale.entity';
import { SaleItem } from '../../../domain/sales/entities/sale-item.entity';
import { StockMovement, StockMovementType } from '../../../domain/sales/entities/stock-movement.entity';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Update Sale Use Case
 * Updates a sale and adjusts product stock accordingly
 */
@Injectable()
export class UpdateSaleUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('ISaleRepository')
    private readonly saleRepository: ISaleRepository,
    @Inject('IStockMovementRepository')
    private readonly stockMovementRepository: IStockMovementRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateSaleDto,
    currentUser: RequestUser,
  ): Promise<SaleResponseDto> {
    const tenantId = currentUser.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is required to update sales');
    }

    // Find existing sale
    const existingSale = await this.saleRepository.findById(id);
    if (!existingSale) {
      throw new NotFoundException(`Sale with ID "${id}" not found`);
    }

    // Verify tenant ownership
    if (existingSale.tenantId !== tenantId) {
      throw new ForbiddenException('You do not have permission to update this sale');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Sale must have at least one item');
    }

    // Step 1: Reverse existing stock movements (add stock back)
    for (const existingItem of existingSale.items) {
      const product = await this.productRepository.findById(existingItem.productId);
      if (product) {
        product.increaseStock(existingItem.quantity);
        await this.productRepository.update(product);
      }
    }

    // Step 2: Delete old stock movements
    const oldMovements = await this.stockMovementRepository.findByReferenceId(id);
    for (const movement of oldMovements) {
      await this.stockMovementRepository.delete(movement.id);
    }

    // Step 3: Validate new items and create sale items
    const saleItems: SaleItem[] = [];
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
        id,
        itemDto.productId,
        itemDto.quantity,
        itemDto.unitPrice,
        itemDto.discountAmount || 0,
      );
      saleItems.push(saleItem);
    }

    // Step 4: Update sale
    existingSale.updateItems(saleItems);
    existingSale.updatePaymentMethod(dto.paymentMethod);
    existingSale.updateDiscount(dto.discountAmount || 0);

    const updatedSale = await this.saleRepository.update(existingSale);

    // Step 5: Update product stock and create new stock movements
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
        id,
        `Sale ${updatedSale.saleNumber}`,
      );

      await this.productRepository.update(product);
      await this.stockMovementRepository.save(movement);
    }

    // Reload sale with items
    const saleWithItems = await this.saleRepository.findById(id);
    if (!saleWithItems) {
      throw new Error('Failed to load sale after update');
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

