import { Sale } from '../entities/sale.entity';
import { StockMovement } from '../entities/stock-movement.entity';

/**
 * Sale Repository Interface (Port)
 */
export interface ISaleRepository {
  findById(id: string): Promise<Sale | null>;
  findBySaleNumber(saleNumber: string, tenantId: string): Promise<Sale | null>;
  findByTenantId(tenantId: string): Promise<Sale[]>;
  findByCashierId(cashierId: string): Promise<Sale[]>;
  findByTenantIdAndDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Sale[]>;
  save(sale: Sale): Promise<Sale>;
  update(sale: Sale): Promise<Sale>;
  delete(id: string): Promise<void>;
}

/**
 * StockMovement Repository Interface (Port)
 */
export interface IStockMovementRepository {
  findById(id: string): Promise<StockMovement | null>;
  findByProductId(productId: string): Promise<StockMovement[]>;
  findByTenantId(tenantId: string): Promise<StockMovement[]>;
  findByReferenceId(referenceId: string): Promise<StockMovement[]>;
  save(movement: StockMovement): Promise<StockMovement>;
  findAll(): Promise<StockMovement[]>;
  delete(id: string): Promise<void>;
}

