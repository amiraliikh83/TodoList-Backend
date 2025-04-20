import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/modules/schemas/user.schema';

// user.service.ts
@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async create(userDto: any) {
    const newUser = new this.userModel(userDto);
    return newUser.save();
  }

  async updatePassword(userId: string, password: string) {
    return this.userModel.findByIdAndUpdate(userId, { password });
  }
}
