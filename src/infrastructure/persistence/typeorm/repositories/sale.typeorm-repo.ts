import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  ISaleRepository,
  IStockMovementRepository,
} from '../../../../domain/sales/repositories/sale.repository';
import { Sale } from '../../../../domain/sales/entities/sale.entity';
import { StockMovement } from '../../../../domain/sales/entities/stock-movement.entity';
import { SaleEntity } from '../entities/sale.typeorm-entity';
import { StockMovementEntity } from '../entities/stock-movement.typeorm-entity';

/**
 * Sale Repository Implementation (TypeORM)
 */
@Injectable()
export class SaleRepository implements ISaleRepository {
  constructor(
    @InjectRepository(SaleEntity)
    private readonly repository: Repository<SaleEntity>,
  ) {}

  async findById(id: string): Promise<Sale | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });
    return entity ? entity.toDomain() : null;
  }

  async findBySaleNumber(saleNumber: string, tenantId: string): Promise<Sale | null> {
    const entity = await this.repository.findOne({
      where: { saleNumber, tenantId },
      relations: ['items', 'items.product'],
    });
    return entity ? entity.toDomain() : null;
  }

  async findByTenantId(tenantId: string): Promise<Sale[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => entity.toDomain());
  }

  async findByCashierId(cashierId: string): Promise<Sale[]> {
    const entities = await this.repository.find({
      where: { cashierId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => entity.toDomain());
  }

  async findByTenantIdAndDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Sale[]> {
    const entities = await this.repository.find({
      where: {
        tenantId,
        createdAt: Between(startDate, endDate),
      },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => entity.toDomain());
  }

  async save(sale: Sale): Promise<Sale> {
    const entity = SaleEntity.fromDomain(sale);
    const saved = await this.repository.save(entity);
    const found = await this.findById(saved.id);
    return found || saved.toDomain();
  }

  async update(sale: Sale): Promise<Sale> {
    return this.save(sale);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

/**
 * StockMovement Repository Implementation (TypeORM)
 */
@Injectable()
export class StockMovementRepository implements IStockMovementRepository {
  constructor(
    @InjectRepository(StockMovementEntity)
    private readonly repository: Repository<StockMovementEntity>,
  ) {}

  async findById(id: string): Promise<StockMovement | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? entity.toDomain() : null;
  }

  async findByProductId(productId: string): Promise<StockMovement[]> {
    const entities = await this.repository.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => entity.toDomain());
  }

  async findByTenantId(tenantId: string): Promise<StockMovement[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => entity.toDomain());
  }

  async findByReferenceId(referenceId: string): Promise<StockMovement[]> {
    const entities = await this.repository.find({
      where: { referenceId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => entity.toDomain());
  }

  async save(movement: StockMovement): Promise<StockMovement> {
    const entity = StockMovementEntity.fromDomain(movement);
    const saved = await this.repository.save(entity);
    return saved.toDomain();
  }

  async findAll(): Promise<StockMovement[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => entity.toDomain());
  }
}

