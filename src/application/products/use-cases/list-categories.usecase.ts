import { Injectable, Inject } from '@nestjs/common';
import type { ICategoryRepository } from '../../../domain/products/repositories/product.repository';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * List Categories Use Case
 */
@Injectable()
export class ListCategoriesUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(currentUser: RequestUser): Promise<
    Array<{
      id: string;
      name: string;
      description?: string;
      tenantId: string;
      createdAt: Date;
      updatedAt: Date;
    }>
  > {
    if (!currentUser.tenantId) {
      throw new Error('Tenant ID is required to list categories');
    }

    const categories = await this.categoryRepository.findByTenantId(
      currentUser.tenantId,
    );

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      tenantId: category.tenantId,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
  }
}

