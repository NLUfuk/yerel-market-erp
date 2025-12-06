import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { GetSalesSummaryUseCase } from '../../application/reports/use-cases/get-sales-summary.usecase';
import { GetTopProductsUseCase } from '../../application/reports/use-cases/get-top-products.usecase';
import { Roles } from '../../infrastructure/security/decorators/roles.decorator';
import { CurrentUser } from '../../infrastructure/security/decorators/current-user.decorator';
import type { RequestUser } from '../../infrastructure/security/jwt.strategy';

/**
 * Reports Controller
 * Handles reporting endpoints
 * Protected by global JwtAuthGuard and RolesGuard
 */
@ApiTags('Reports')
@Controller('reports')
@ApiBearerAuth()
@Roles('TenantAdmin', 'Viewer')
export class ReportsController {
  constructor(
    private readonly getSalesSummaryUseCase: GetSalesSummaryUseCase,
    private readonly getTopProductsUseCase: GetTopProductsUseCase,
  ) {}

  @Get('sales-summary')
  @ApiOperation({ summary: 'Get sales summary report' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'Sales summary report',
  })
  async getSalesSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.getSalesSummaryUseCase.execute(
      new Date(startDate),
      new Date(endDate),
      user,
    );
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top products report' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  @ApiResponse({
    status: 200,
    description: 'Top products report',
  })
  async getTopProducts(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit') limit: number = 10,
    @CurrentUser() user: RequestUser,
  ) {
    return this.getTopProductsUseCase.execute(
      new Date(startDate),
      new Date(endDate),
      user,
      limit,
    );
  }
}

