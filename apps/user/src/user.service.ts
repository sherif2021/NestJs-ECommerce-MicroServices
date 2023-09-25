import { BadRequestException, NotFoundException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { Rule, decryptText, encryptText } from '@app/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UserService {

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  async getUserById(id: string): Promise<User> {
    const user = await this.userModel.findOne({ _id: id }).select('-password').exec();

    if (!user) throw new NotFoundException('the user is not exist');

    return user;
  }
  async createUser(name: string, email: string, phone: string, password: string): Promise<User> {

    const existUser = await this.userModel.findOne({ email }).exec();

    if (existUser) throw new RpcException(new BadRequestException('email is already exist'));

    const userObject = new this.userModel({
      name,
      email,
      phone,
      password: encryptText(password),
      rules: email == 'shiref2020@gmail.com' ? [Rule.Admin] : [],
    });
    return userObject.save();
  }

  async getUserByEmailAndPassword(email: string, password: string): Promise<User> {

    const user = await this.userModel.findOne({ email }).exec();

    if (!user) throw new RpcException(new NotFoundException('email is not exist'));

    const decryptedPassword = decryptText(user.password);

    if (decryptedPassword != password) throw new RpcException(new BadRequestException('invalid credentials'));

    user.password = decryptedPassword;
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {

    const user = await this.userModel.findOneAndUpdate({ _id: id }, updateUserDto, { returnOriginal: false }).select('-password').exec();

    if (!user) throw new UnauthorizedException('the user is not exist');

    return user;
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<User> {

    const user = await this.userModel.findById(id).exec();

    if (!user) throw new UnauthorizedException('the user is not exist');

    const decryptedPassword = decryptText(user.password);

    if (decryptedPassword != updatePasswordDto.oldPassword) throw new BadRequestException('invalid old Password');

    return this.userModel.findOneAndUpdate({ _id: id }, { password: encryptText(updatePasswordDto.newPassword) }, { returnOriginal: false }).select('-password').exec();
  }
}
