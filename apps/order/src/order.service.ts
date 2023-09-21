import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './entites/order.entity';
import { Model } from 'mongoose';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { OrderStatus } from './common/order_status';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @Inject('ITEMS_SERVICE') private itemsClient: ClientProxy,
    @Inject('CART_SERVICE') private cartClient: ClientProxy,
  ) { }

  getUserOrders(userId?: string, status: OrderStatus[] = []): Promise<Order[]> {
    return this.orderModel.find(userId ? status.length > 0 ? { userId, status: { $in: status } } : { userId } : status.length > 0 ? { status: { $in: status } } : {}).exec();
  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {

    const cart = await this.getCartFromMS(userId);
    if (cart.length == 0) throw new BadRequestException('Your Cart is Empty');

    const products = await this.getProductsFromMS(userId, cart.map(e => e['productId']));

    for (const cartItem of cart) {
      for (const product of products) {
        if (cartItem['productId'] == product.id) {
          cartItem['product'] = product;
          break;
        }
      }
    }

    const filteredCart = cart.filter(e => e['product']);

    this.sendClearCartToMS(userId);

    if (filteredCart.length == 0) throw new BadRequestException('Your Cart is Empty');

    return (new this.orderModel({
      products,
      total: filteredCart.reduce((a, b) => a + (b['quantity'] * b['product']['price']), 0),
      userId,
      ...createOrderDto,
    })).save();
  }

  async updateOrderStatus(updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderModel.findOneAndUpdate({ _id: updateOrderStatusDto.orderId }, { status: updateOrderStatusDto.status }, { returnOriginal: false }).exec();

    if (!order) throw new NotFoundException('this Order not found');

    return order;
  }

  private getCartFromMS(userId: string): Promise<Array<any>> {
    return firstValueFrom(this.cartClient.send('get-cart', { userId })
      .pipe(catchError(error => throwError(() => new RpcException(error.response)))));
  }

  private getProductsFromMS(userId: string, products: string[]): Promise<Array<any>> {
    return firstValueFrom(this.itemsClient.send('get-products', { userId, products })
      .pipe(catchError(error => throwError(() => new RpcException(error.response)))));
  }

  private sendClearCartToMS(userId: string) {
    return firstValueFrom(this.cartClient.send('clear-cart', { userId }));
  }
}
