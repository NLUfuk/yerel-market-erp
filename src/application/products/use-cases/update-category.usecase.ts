import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import type { ICategoryRepository } from '../../../domain/products/repositories/product.repository';
import { RequestUser } from '../../../infrastructure/security/jwt.strategy';

/**
 * Update Category Use Case
 */
@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateCategoryDto,
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
      throw new ForbiddenException('Tenant ID is required to update categories');
    }

    // Find category
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    // Verify tenant ownership
    if (category.tenantId !== tenantId) {
      throw new ForbiddenException('You do not have permission to update this category');
    }

    // Check if name is being changed and if new name already exists
    if (dto.name && dto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findByName(
        dto.name,
        tenantId,
      );
      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException(
          `Category with name "${dto.name}" already exists`,
        );
      }
      category.name = dto.name;
    }

    // Update description if provided
    if (dto.description !== undefined) {
      category.description = dto.description;
    }

    // Update timestamp
    category.updatedAt = new Date();

    const updatedCategory = await this.categoryRepository.update(category);

    return {
      id: updatedCategory.id,
      name: updatedCategory.name,
      description: updatedCategory.description,
      tenantId: updatedCategory.tenantId,
      createdAt: updatedCategory.createdAt,
      updatedAt: updatedCategory.updatedAt,
    };
  }
}

