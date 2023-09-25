import { Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Cart } from './entities/cart.entity';
import { Model } from 'mongoose';

@Injectable()
export class CartService {

  constructor(
    @Inject('ITEMS_SERVICE') private itemsClient: ClientProxy,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
  ) { }


  async getCartItems(userId: string): Promise<any> {

    const cart = await this.cartModel.find({ userId }).exec();

    if (cart.length > 0) {

      const products = await this.getProductsFromMS(userId, cart.map(e => e.productId));

      for (const cartItem of cart) {
        for (const product of products) {
          if (cartItem.productId == product.id) {
            cartItem.product = product;
            cartItem['test'] = 'sherif';
            break;
          }
        }
      }
      const notExistProducts = cart.filter(e => !e.product);

      if (notExistProducts.length > 0) {
        this.cartModel.deleteMany({ _id: notExistProducts.map(e => e.id) }).exec();
      }
    }
    const filteredCart = cart.filter(e => e.product);

    return {
      'products': filteredCart,
      'total': filteredCart.reduce((a, b) => a + (b.quantity * b.product['price']), 0),
    };
  }

  async addProductToCart(userId: string, addToCartDto: AddToCartDto) {
    const product = await this.getProductFromMS(userId, addToCartDto.productId);

    const existProductOnCart = await this.cartModel.findOne({ userId, productId: addToCartDto.productId }).exec();

    if (existProductOnCart) throw new BadRequestException('this product already exist on your cart');

    const productOnCart = await (new this.cartModel({ userId, ...addToCartDto })).save();

    productOnCart.product = product;

    return productOnCart;
  }

  async removeProductFromCart(userId: string, productId: string): Promise<Cart> {
    const data = await Promise.all([
      this.getProductFromMS(userId, productId, false),
      this.cartModel.findOneAndDelete({ userId, productId }).exec(),
    ]);

    const product = data[0];
    const productOnCart = data[1];

    if (!productOnCart) throw new NotFoundException('this Product on your cart is not exist');
    productOnCart.product = product;

    return productOnCart;
  }

  async addQuantity(userId: string, addToCartDto: AddToCartDto) {
    const product = await this.getProductFromMS(userId, addToCartDto.productId);

    if (!product) {
      this.cartModel.deleteOne({ userId, productId: addToCartDto.productId }).exec();
      throw new NotFoundException('this product is not exist');
    }

    const cart = await this.cartModel.findOneAndUpdate({ userId, productId: addToCartDto.productId }, { $inc: { quantity: addToCartDto.quantity ?? 1 } }, { returnOriginal: false }).exec();

    if (!cart) {
      const productOnCart = await (new this.cartModel({ userId, ...addToCartDto })).save();
      productOnCart.product = product;
      return productOnCart;
    }

    cart.product = product;
    return cart;
  }

  async deleteQuantity(userId: string, addToCartDto: AddToCartDto) {
    const product = await this.getProductFromMS(userId, addToCartDto.productId);

    if (!product) {
      this.cartModel.deleteOne({ userId, productId: addToCartDto.productId }).exec();
      throw new NotFoundException('this product is not exist');
    }

    const cart = await this.cartModel.findOneAndUpdate({ userId, productId: addToCartDto.productId }, { $inc: { quantity: -(addToCartDto.quantity ?? 1) } }, { returnOriginal: false, new: false }).exec();

    if (!cart)
      throw new NotFoundException('this product on your cart is not exist');

    else if (cart.quantity < 1) {
      this.cartModel.deleteOne({ _id: cart.id }).exec();
      throw new BadRequestException('The Product was Removed from your Cart');
    }

    cart.product = product;
    return cart;
  }

  clearCart(userId: string) {
    this.cartModel.deleteMany({ userId }).exec();
    return {
      'products': [],
      'total': 0,
    }
  }

  getCartForMS(userId: string): Promise<Cart[]> {
    return this.cartModel.find({ userId }).exec();
  }

  private getProductFromMS(userId: string, productId: string, throwIfNotExist: boolean = true): Promise<any> {
    return firstValueFrom(this.itemsClient.send('get-product', { userId, productId, throwIfNotExist })
      .pipe(catchError(error => throwError(() => new RpcException(error.response)))));
  }

  private getProductsFromMS(userId: string, products: string[]): Promise<any> {
    return firstValueFrom(this.itemsClient.send('get-products', { userId, products })
      .pipe(catchError(error => throwError(() => new RpcException(error.response)))));
  }
}
