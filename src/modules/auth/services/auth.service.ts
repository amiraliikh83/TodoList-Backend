import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { CreateUserDto } from '../../dto/create-user.dto';
import { LoginUserDto } from '../../dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<void> {
    const existingUser = await this.userModel.findOne({
      userEmail: createUserDto.userEmail,
    });
    if (existingUser) {
      throw new BadRequestException('Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = new this.userModel({
      userName: createUserDto.userName,
      userEmail: createUserDto.userEmail,
      password: hashedPassword,
    });

    await newUser.save();
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string; statusCode: number }> {
    const user = await this.userModel.findOne({
      email: loginUserDto.username,
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.userEmail, sub: user._id };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, statusCode: HttpStatus.OK };
  }
}
