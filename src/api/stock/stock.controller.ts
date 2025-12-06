import {
  Controller,
  Get,
  Post,
  Put,
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
import { CreateStockMovementDto } from '../../application/stock/dto/stock-movement.dto';
import { StockMovementResponseDto } from '../../application/stock/dto/stock-movement-response.dto';
import { CreateStockMovementUseCase } from '../../application/stock/use-cases/create-stock-movement.usecase';
import { AdjustStockUseCase } from '../../application/stock/use-cases/adjust-stock.usecase';
import { ListStockMovementsUseCase } from '../../application/stock/use-cases/list-stock-movements.usecase';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { CurrentUser } from '../../infrastructure/security/decorators/current-user.decorator';
import type { RequestUser } from '../../infrastructure/security/jwt.strategy';

/**
 * Stock Controller
 * Handles stock movement management
 * Protected by global JwtAuthGuard and RolesGuard
 */
@ApiTags('Stock')
@Controller('stock')
@ApiBearerAuth()
@Roles('TenantAdmin', 'Cashier')
export class StockController {
  constructor(
    private readonly createStockMovementUseCase: CreateStockMovementUseCase,
    private readonly adjustStockUseCase: AdjustStockUseCase,
    private readonly listStockMovementsUseCase: ListStockMovementsUseCase,
  ) {}

  @Get('movements')
  @ApiOperation({ summary: 'List stock movements' })
  @ApiResponse({
    status: 200,
    description: 'List of stock movements',
  })
  async listMovements(
    @Query('productId') productId: string | undefined,
    @CurrentUser() user: RequestUser,
  ) {
    return this.listStockMovementsUseCase.execute(user, productId);
  }

  @Post('movements')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create stock movement' })
  @ApiResponse({
    status: 201,
    description: 'Stock movement created successfully',
    type: StockMovementResponseDto,
  })
  async createMovement(
    @Body() createDto: CreateStockMovementDto,
    @CurrentUser() user: RequestUser,
  ): Promise<StockMovementResponseDto> {
    return this.createStockMovementUseCase.execute(createDto, user);
  }

  @Put('products/:productId/adjust')
  @ApiOperation({ summary: 'Adjust stock quantity (TenantAdmin only)' })
  @ApiResponse({
    status: 200,
    description: 'Stock adjusted successfully',
  })
  @Roles('TenantAdmin')
  async adjustStock(
    @Param('productId') productId: string,
    @Body() body: { newQuantity: number; notes?: string },
    @CurrentUser() user: RequestUser,
  ) {
    return this.adjustStockUseCase.execute(
      productId,
      body.newQuantity,
      body.notes || 'Manual stock adjustment',
      user,
    );
  }
}

