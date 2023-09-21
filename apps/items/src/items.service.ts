import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './entites/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Prodcut } from './entites/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FavoriteProduct } from './entites/favorite-product.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ItemsService {

  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Prodcut.name) private productModel: Model<Prodcut>,
    @InjectModel(FavoriteProduct.name) private favoriteProductModel: Model<FavoriteProduct>,
  ) { }

  getCategories(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return (new this.categoryModel(createCategoryDto)).save();
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryModel.findOneAndUpdate({ _id: id }, updateCategoryDto, { returnOriginal: false }).exec();

    if (!category) throw new NotFoundException('this category is not found');

    return category;
  }

  async deleteCategory(id: string): Promise<Category> {
    const category = await this.categoryModel.findOneAndDelete({ _id: id }).exec();

    if (!category) throw new NotFoundException('this category is not found');

    this.productModel.deleteMany({ categoryId: id }).exec();

    return category;
  }

  async getHomeProducts(userId?: string): Promise<Prodcut[]> {
    const products = await this.productModel.find().limit(20).exec();
    await this.getUserFavoriteProdcuts(products, userId);
    return products;
  }

  async getProductsByCategory(categoryId: string, userId?: string): Promise<Prodcut[]> {
    const products = await this.productModel.find({ categoryId }).limit(20).exec();
    await this.getUserFavoriteProdcuts(products, userId);
    return products;
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Prodcut> {

    const category = await this.categoryModel.findById(createProductDto.categoryId).select('_id').exec();

    if (!category) throw new NotFoundException('this category is not found');

    return (new this.productModel(createProductDto)).save();
  }

  async updateProdcut(id: string, updateProductDto: UpdateProductDto): Promise<Prodcut> {

    if (updateProductDto.categoryId) {
      const category = await this.categoryModel.findById(updateProductDto.categoryId).select('_id').exec();

      if (!category) throw new NotFoundException('this category is not found');
    }

    const product = await this.productModel.findOneAndUpdate({ _id: id }, updateProductDto, { returnOriginal: false }).exec();

    if (!product) throw new NotFoundException('this product is not found');

    return product;
  }

  async deleteProduct(id: string): Promise<Prodcut> {
    const product = await this.productModel.findOneAndDelete({ _id: id }).exec();

    if (!product) throw new NotFoundException('this product is not found');

    return product;
  }

  async getFavoriteProducts(userId: string): Promise<Prodcut[]> {
    const favorite = await this.favoriteProductModel.find({ userId }).limit(20).select('productId').exec();

    if (favorite.length == 0) return [];

    const products = await this.productModel.find({ _id: { $in: favorite.map(e => new Types.ObjectId(e.productId)) } }).exec();

    for (const product of products) {
      product.isFavorite = true;
    }

    return products;
  }

  async createFavoriteProduct(userId: string, productId: string): Promise<Prodcut> {
    const product = await this.productModel.findById(productId).exec();

    if (!product) throw new NotFoundException('this product is not found');

    this.favoriteProductModel.updateOne({ productId, userId }, { productId, userId }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
    product.isFavorite = true;
    return product;
  }

  async deleteFavoriteProduct(userId: string, productId: string): Promise<Prodcut> {
    const product = await this.productModel.findById(productId).exec();

    if (!product) throw new NotFoundException('this product is not found');

    this.favoriteProductModel.deleteOne({ productId, userId }).exec();
    product.isFavorite = false;
    return product;
  }

  async getProductForMS(userId: string, productId: string, throwIfNotExist: boolean): Promise<Prodcut> {
    const product = await this.productModel.findById(productId).exec();

    if (!product) {
      if (throwIfNotExist) throw new RpcException(new NotFoundException('this product is not found'));
      else return null;
    }

    await this.getUserFavoriteProdcuts([product], userId);
    return product;
  }

  async getProductsForMS(userId: string, productsIds: string[]): Promise<Prodcut[]> {
    const products = await this.productModel.find({ _id: { $in: productsIds } }).exec();

    await this.getUserFavoriteProdcuts(products, userId);
    return products;
  }

  private async getUserFavoriteProdcuts(products: Prodcut[], userId?: string) {
    if (products.length == 0) return;

    var result: string[] = [];

    if (userId) {
      result = await this.favoriteProductModel.find({ userId, productId: { $in: products.map(e => e.id) } }).distinct('productId').exec();
    }

    for (const product of products) {
      product.isFavorite = result.indexOf(product.id) != -1;
    }
  }
}
