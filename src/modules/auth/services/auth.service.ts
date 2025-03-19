import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/modules/dto/create-user.dto';
import { LoginUserDto } from 'src/modules/dto/login-user.dto';

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
      userEmail: loginUserDto.userEmail,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!loginUserDto.password) {
      throw new BadRequestException('Password is required');
    }

    if (!user.password) {
      throw new UnauthorizedException('User has no password set');
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

  async forgotPassword(Email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ userEmail: Email });
    if (!user) {
      throw new NotFoundException('User with this CodeMeli not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);

    user.resetToken = token;
    user.resetTokenExpiry = expiryDate;
    await user.save();

    console.log('Reset token stored in database, sending email.');

    await this.sendResetEmail(user.userEmail, token);

    return { message: 'Password reset link sent to email' };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ resetToken: token });

    if (!user || !user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return { message: 'Password successfully reset' };
  }

  private async sendResetEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      html: `<p>You requested a password reset. Click the link below:</p>
             <p><a href="${resetLink}">${resetLink}</a></p>`,
    });
  }
}
