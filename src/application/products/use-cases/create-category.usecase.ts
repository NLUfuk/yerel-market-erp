import {
  Injectable,
  ConflictException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateCategoryDto } from '../dto/create-category.dto';
import type { ICategoryRepository } from '../../../domain/products/repositories/product.repository';
import { Category } from '../../../domain/products/entities/category.entity';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Create Category Use Case
 */
@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(
    dto: CreateCategoryDto,
    currentUser: RequestUser,
  ): Promise<{
    id: string;
    name: string;
    description?: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const tenantId = currentUser.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is required to create categories');
    }

    // Check if category name already exists for this tenant
    const existingCategory = await this.categoryRepository.findByName(
      dto.name,
      tenantId,
    );
    if (existingCategory) {
      throw new ConflictException(
        `Category with name "${dto.name}" already exists`,
      );
    }

    // Create category
    const categoryId = uuidv4();
    const category = new Category(
      categoryId,
      dto.name,
      tenantId,
      new Date(),
      new Date(),
      dto.description,
    );

    const savedCategory = await this.categoryRepository.save(category);

    return {
      id: savedCategory.id,
      name: savedCategory.name,
      description: savedCategory.description,
      tenantId: savedCategory.tenantId,
      createdAt: savedCategory.createdAt,
      updatedAt: savedCategory.updatedAt,
    };
  }
}

