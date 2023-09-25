import { Controller, Get, Patch, UseGuards, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService, UserAuth, UserGuard, UserJwt } from '@app/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService,
    private readonly rmqService: RmqService,
  ) { }

  @Get('')
  @UseGuards(UserGuard)
  getUser(@UserJwt() userAuth: UserAuth) {
    return this.userService.getUserById(userAuth.id);
  }

  @Patch('')
  @UseGuards(UserGuard)
  updateUser(@UserJwt() userAuth: UserAuth, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(userAuth.id, updateUserDto);
  }

  @Patch('update-password')
  @UseGuards(UserGuard)
  updatePassword(@UserJwt() userAuth: UserAuth, @Body() updatePasswordDto: UpdatePasswordDto) {
    return this.userService.updatePassword(userAuth.id, updatePasswordDto);
  }

  @MessagePattern('create-user')
  async createUser(@Ctx() context: RmqContext, @Payload() data: any): Promise<any> {
    this.rmqService.ack(context);

    const { name, email, phone, password } = data;

    return this.userService.createUser(name, email, phone, password);
  }

  @MessagePattern('get-user-by-email-password')
  async getUserByEmailAndPassword(@Ctx() context: RmqContext, @Payload() data: any): Promise<any> {
    this.rmqService.ack(context);

    const { email, password } = data;

    return this.userService.getUserByEmailAndPassword(email, password);
  }
}
