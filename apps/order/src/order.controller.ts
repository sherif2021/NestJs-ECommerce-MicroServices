import { Controller, Get, Post, Body, UseGuards, Patch } from '@nestjs/common';
import { OrderService } from './order.service';
import { Rule, Rules, RulesGuard, UserAuth, UserGuard, UserJwt } from '@app/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entites/order.entity';
import { OrderStatus } from './common/order_status';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Get('all')
  @UseGuards(UserGuard)
  getUserOrders(@UserJwt() userAuth: UserAuth): Promise<Order[]> {
    const isAdminOrManager = userAuth.rules.filter(e => e == Rule.Admin || e == Rule.Manager).length != 0;
    return this.orderService.getUserOrders(isAdminOrManager ? null : userAuth.id);
  }

  @Get('pending')
  @UseGuards(UserGuard)
  getPendingOrders(@UserJwt() userAuth: UserAuth): Promise<Order[]> {
    const isAdminOrManager = userAuth.rules.filter(e => e == Rule.Admin || e == Rule.Manager).length != 0;
    return this.orderService.getUserOrders(isAdminOrManager ? null : userAuth.id, [OrderStatus.watingForAdminAprroeved, OrderStatus.approved, OrderStatus.shipped, OrderStatus.delivered, OrderStatus.readyToShip]);
  }

  @Get('completed')
  @UseGuards(UserGuard)
  getCompletedOrders(@UserJwt() userAuth: UserAuth): Promise<Order[]> {
    const isAdminOrManager = userAuth.rules.filter(e => e == Rule.Admin || e == Rule.Manager).length != 0;
    return this.orderService.getUserOrders(isAdminOrManager ? null : userAuth.id, [OrderStatus.completed]);
  }

  @Post('create')
  @UseGuards(UserGuard)
  createOrder(@UserJwt() userAuth: UserAuth, @Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.createOrder(userAuth.id, createOrderDto);
  }

  @Patch('status')
  @UseGuards(UserGuard, RulesGuard)
  @Rules(Rule.Admin, Rule.Manager)
  updateOrderStatus(@Body() updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    return this.orderService.updateOrderStatus(updateOrderStatusDto);
  }
}
