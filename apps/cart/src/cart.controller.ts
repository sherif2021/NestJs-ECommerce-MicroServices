import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { ParseObjectIdPipe, RmqService, UserAuth, UserGuard, UserJwt } from '@app/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { Cart } from './entites/cart.entity';

@Controller()
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly rmqService: RmqService,) { }

  @Get()
  @UseGuards(UserGuard)
  getCart(@UserJwt() userAuth: UserAuth) {
    return this.cartService.getCartItems(userAuth.id);
  }

  @Post('add-quantity')
  @UseGuards(UserGuard)
  addQuantity(@UserJwt() userAuth: UserAuth, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addQuantity(userAuth.id, addToCartDto);
  }

  @Delete('delete-quantity')
  @UseGuards(UserGuard)
  deleteQuantity(@UserJwt() userAuth: UserAuth, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.deleteQuantity(userAuth.id, addToCartDto);
  }

  @Delete('clear-cart')
  @UseGuards(UserGuard)
  clearCart(@UserJwt() userAuth: UserAuth) {
    return this.cartService.clearCart(userAuth.id);
  }

  @Post()
  @UseGuards(UserGuard)
  addProductToCart(@UserJwt() userAuth: UserAuth, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addProdcutToCart(userAuth.id, addToCartDto);
  }

  @Delete(':id')
  @UseGuards(UserGuard)
  removeProductFromCart(@UserJwt() userAuth: UserAuth, @Param('id', ParseObjectIdPipe) productId: string) {
    return this.cartService.removeProductFromCart(userAuth.id, productId);
  }

  @MessagePattern('get-cart')
  getCartForMC(@Ctx() context: RmqContext, @Payload() data: any): Promise<Cart[]> {
    this.rmqService.ack(context);

    const { userId } = data;

    return this.cartService.getCartForMS(userId);
  }

  @MessagePattern('clear-cart')
  clearCartForMC(@Ctx() context: RmqContext, @Payload() data: any) {

    this.rmqService.ack(context);

    const { userId } = data;

    return this.cartService.clearCart(userId);
  }
}
