import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomJwtModule, RmqModule } from '@app/common';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './entities/category.entity';
import { Product, ProductSchema } from './entities/product.entity';
import { FavoriteProduct, FavoriteProductSchema } from './entities/favorite-product.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
      validationSchema: Joi.object({
        'RABBITMQ_DEFAULT_USER': Joi.string().required(),
        'RABBITMQ_DEFAULT_PASS': Joi.string().required(),
        'RABBITMQ_ITEMS_SERVICE_QUEUE': Joi.string().required(),
        'ITEMS_MONGO_URI': Joi.string().required(),
      })
    }),
    CustomJwtModule,
    RmqModule,
    MongooseModule.forRootAsync(
      {
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          uri: configService.get<string>('ITEMS_MONGO_URI'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
        inject: [ConfigService],
      }
    ),
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: FavoriteProduct.name,
        schema: FavoriteProductSchema,
      }
    ])
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule { }