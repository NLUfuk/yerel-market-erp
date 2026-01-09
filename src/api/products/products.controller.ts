import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateProductDto } from '../../application/products/dto/create-product.dto';
import { UpdateProductDto } from '../../application/products/dto/update-product.dto';
import { CreateCategoryDto } from '../../application/products/dto/create-category.dto';
import { UpdateCategoryDto } from '../../application/products/dto/update-category.dto';
import { ProductResponseDto } from '../../application/products/dto/product-response.dto';
import { PaginationDto } from '../../application/shared/dto/pagination.dto';
import { CreateProductUseCase } from '../../application/products/use-cases/create-product.usecase';
import { UpdateProductUseCase } from '../../application/products/use-cases/update-product.usecase';
import { ListProductsUseCase } from '../../application/products/use-cases/list-products.usecase';
import { CreateCategoryUseCase } from '../../application/products/use-cases/create-category.usecase';
import { UpdateCategoryUseCase } from '../../application/products/use-cases/update-category.usecase';
import { DeleteCategoryUseCase } from '../../application/products/use-cases/delete-category.usecase';
import { DeleteProductUseCase } from '../../application/products/use-cases/delete-product.usecase';
import { ListCategoriesUseCase } from '../../application/products/use-cases/list-categories.usecase';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { CurrentUser } from '../../infrastructure/security/decorators/current-user.decorator';
import type { RequestUser } from '../../infrastructure/security/jwt.strategy';

/**
 * Products Controller
 * Handles product and category management
 * Protected by global JwtAuthGuard and RolesGuard
 */
@ApiTags('Products')
@Controller('products')
@ApiBearerAuth()
@Roles('TenantAdmin', 'Cashier', 'Viewer')
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('TenantAdmin')
  @ApiOperation({ summary: 'Create a new product (TenantAdmin only)' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  async create(
    @Body() createDto: CreateProductDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ProductResponseDto> {
    return this.createProductUseCase.execute(createDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List products' })
  @ApiResponse({
    status: 200,
    description: 'List of products',
  })
  async list(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.listProductsUseCase.execute(pagination, user);
  }

  @Put(':id')
  @Roles('TenantAdmin')
  @ApiOperation({ summary: 'Update product (TenantAdmin only)' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductDto,
    @CurrentUser() user: RequestUser,
  ): Promise<ProductResponseDto> {
    return this.updateProductUseCase.execute(id, updateDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('TenantAdmin')
  @ApiOperation({ summary: 'Delete product (TenantAdmin only, soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Product deleted successfully (deactivated)',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<void> {
    return this.deleteProductUseCase.execute(id, user);
  }

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @Roles('TenantAdmin')
  @ApiOperation({ summary: 'Create a new category (TenantAdmin only)' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
  })
  async createCategory(
    @Body() createDto: CreateCategoryDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.createCategoryUseCase.execute(createDto, user);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List categories' })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
  })
  async listCategories(@CurrentUser() user: RequestUser) {
    return this.listCategoriesUseCase.execute(user);
  }

  @Put('categories/:id')
  @Roles('TenantAdmin')
  @ApiOperation({ summary: 'Update a category (TenantAdmin only)' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategoryDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.updateCategoryUseCase.execute(id, updateDto, user);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('TenantAdmin')
  @ApiOperation({ summary: 'Delete a category (TenantAdmin only)' })
  @ApiResponse({
    status: 204,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete category with products',
  })
  async deleteCategory(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    await this.deleteCategoryUseCase.execute(id, user);
  }
}

