import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { CreateUserDto } from '../../dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async register(createUserDto: CreateUserDto): Promise<void> {
    const existingUser = await this.userModel.findOne({ username: createUserDto.username });
    if (existingUser) {
      throw new BadRequestException('Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = new this.userModel({
      username: createUserDto.username,
      password: hashedPassword,
    });

    await newUser.save();
  }
}
