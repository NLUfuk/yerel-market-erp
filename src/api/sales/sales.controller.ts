import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseDatePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateSaleDto } from '../../application/sales/dto/create-sale.dto';
import { SaleResponseDto } from '../../application/sales/dto/sale-response.dto';
import { PaginationDto } from '../../application/shared/dto/pagination.dto';
import { CreateSaleUseCase } from '../../application/sales/use-cases/create-sale.usecase';
import { ListSalesUseCase } from '../../application/sales/use-cases/list-sales.usecase';
import { GetSaleUseCase } from '../../application/sales/use-cases/get-sale.usecase';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { CurrentUser } from '../../infrastructure/security/decorators/current-user.decorator';
import type { RequestUser } from '../../infrastructure/security/jwt.strategy';

/**
 * Sales Controller
 * Handles sales operations
 * Protected by global JwtAuthGuard and RolesGuard
 */
@ApiTags('Sales')
@Controller('sales')
@ApiBearerAuth()
@Roles('TenantAdmin', 'Cashier', 'Viewer')
export class SalesController {
  constructor(
    private readonly createSaleUseCase: CreateSaleUseCase,
    private readonly listSalesUseCase: ListSalesUseCase,
    private readonly getSaleUseCase: GetSaleUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('TenantAdmin', 'Cashier')
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({
    status: 201,
    description: 'Sale created successfully',
    type: SaleResponseDto,
  })
  async create(
    @Body() createDto: CreateSaleDto,
    @CurrentUser() user: RequestUser,
  ): Promise<SaleResponseDto> {
    return this.createSaleUseCase.execute(createDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List sales (with optional filters)' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'cashierId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of sales',
  })
  async list(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: RequestUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('cashierId') cashierId?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.listSalesUseCase.execute(pagination, user, start, end, cashierId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale details' })
  @ApiResponse({
    status: 200,
    description: 'Sale details',
    type: SaleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sale not found',
  })
  async getSale(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<SaleResponseDto> {
    return this.getSaleUseCase.execute(id, user);
  }
}

