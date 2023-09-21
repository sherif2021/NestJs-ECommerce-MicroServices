import { Controller, Get, Post, Body, UseGuards, Delete, Param, Patch, ParseUUIDPipe } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { OptionalUserGuard, ParseObjectIdPipe, RmqService, Rule, Rules, RulesGuard, UserAuth, UserGuard, UserJwt } from '@app/common';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { Prodcut } from './entites/product.entity';

@Controller()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService,
    private readonly rmqService: RmqService,
  ) { }

  @Get('category')
  getCategories() {
    return this.itemsService.getCategories();
  }

  @Post('category')
  @Rules(Rule.Admin)
  @UseGuards(UserGuard, RulesGuard)
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.itemsService.createCategory(createCategoryDto);
  }

  @Patch('category/:id')
  @Rules(Rule.Admin)
  @UseGuards(UserGuard, RulesGuard)
  updateCategory(@Param('id', ParseObjectIdPipe) id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.itemsService.updateCategory(id, updateCategoryDto);
  }

  @Delete('category/:id')
  @Rules(Rule.Admin)
  @UseGuards(UserGuard, RulesGuard)
  deleteCategory(@Param('id', ParseObjectIdPipe) id: string) {
    return this.itemsService.deleteCategory(id);
  }

  @Get('product')
  @UseGuards(OptionalUserGuard)
  getHomeProducts(@UserJwt() userAuth?: UserAuth) {
    return this.itemsService.getHomeProducts(userAuth?.id);
  }

  @Post('product')
  @Rules(Rule.Admin)
  @UseGuards(UserGuard, RulesGuard)
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.itemsService.createProduct(createProductDto);
  }

  @Patch('product/:id')
  @Rules(Rule.Admin)
  @UseGuards(UserGuard, RulesGuard)
  updateProduct(@Param('id', ParseObjectIdPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.itemsService.updateProdcut(id, updateProductDto);
  }

  @Delete('product/:id')
  @Rules(Rule.Admin)
  @UseGuards(UserGuard, RulesGuard)
  deleteProduct(@Param('id', ParseObjectIdPipe) id: string) {
    return this.itemsService.deleteProduct(id);
  }

  @Get('product/favorite')
  @UseGuards(UserGuard)
  getFavoriteProduct(@UserJwt() userAuth: UserAuth) {
    return this.itemsService.getFavoriteProducts(userAuth.id);
  }

  @Get('product/:id')
  @UseGuards(OptionalUserGuard)
  getProdcutsByCategory(@Param('id', ParseObjectIdPipe) categoryId: string, @UserJwt() userAuth?: UserAuth) {
    return this.itemsService.getProductsByCategory(categoryId, userAuth?.id);
  }

  @Post('product/favorite')
  @UseGuards(UserGuard)
  createFavoriteProduct(@UserJwt() userAuth: UserAuth, @Body('productId', ParseObjectIdPipe) productId: string) {
    return this.itemsService.createFavoriteProduct(userAuth.id, productId);
  }

  @Delete('product/favorite/:id')
  @UseGuards(UserGuard)
  deleteFavoriteProduct(@UserJwt() userAuth: UserAuth, @Param('id', ParseObjectIdPipe) productId: string) {
    return this.itemsService.deleteFavoriteProduct(userAuth.id, productId);
  }

  @MessagePattern('get-product')
  getProductForMS(@Ctx() context: RmqContext, @Payload() data: any): Promise<Prodcut> {
    this.rmqService.ack(context);

    const { userId, productId, throwIfNotExist } = data;

    return this.itemsService.getProductForMS(userId, productId, throwIfNotExist);
  }

  @MessagePattern('get-products')
  getProductsForMS(@Ctx() context: RmqContext, @Payload() data: any): Promise<Prodcut[]> {
    this.rmqService.ack(context);

    const { userId, products, } = data;

    return this.itemsService.getProductsForMS(userId, products);
  }
}
