import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private inventoryService: InventoryService) { }

  @Get()
  @ApiOperation({ summary: 'حالة المخزون' })
  getInventory(
    @Query('search') search?: string,
    @Query('lowStock') lowStock?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.inventoryService.getInventory({ search, lowStock, page, limit });
  }

  @Patch(':variantId')
  @ApiOperation({ summary: 'تحديث بيانات المتغير' })
  updateStock(@Param('variantId') variantId: string, @Body() body: any) {
    return (this.inventoryService as any).updateVariant(variantId, body);
  }
}
