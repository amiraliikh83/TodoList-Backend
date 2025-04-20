import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
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
import { PendingUser } from '../../schemas/verify.schema';
import { MailService } from './mail.service';

export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(PendingUser.name) private pendingUserModel: Model<PendingUser>,
    private mailService: MailService, // اضافه کن
    private jwtService: JwtService,
  ) {}

  async startRegistration(dto: CreateUserDto): Promise<void> {
    const existingUser = await this.userModel.findOne({
      userEmail: dto.userEmail,
    });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const password = await bcrypt.hash(dto.password, 10);

    // ذخیره موقت
    await this.pendingUserModel.findOneAndUpdate(
      { userEmail: dto.userEmail },
      {
        userEmail: dto.userEmail,
        userName: dto.userName,
        password,
        code: code,
        expiresAt: Date.now() + 5 * 60 * 1000,
      },
      { upsert: true },
    );

    // ایمیل کد
    await this.mailService.sendEmail({
      to: dto.userEmail,
      subject: 'Verify your email',
      text: `Your code is: ${code}`,
    });
  }

  async confirmRegistration(userEmail: string, code: string): Promise<void> {
    const pending = await this.pendingUserModel.findOne({
      userEmail,
      code: code,
    });

    if (!pending || pending.expiresAt < Date.now()) {
      throw new BadRequestException('Invalid or expired code');
    }

    // ساخت یوزر نهایی
    const newUser = new this.userModel({
      userEmail: userEmail,
      userName: pending.userName,
      password: pending.password,
    });

    await newUser.save();

    // حذف از pending
    await this.pendingUserModel.deleteOne({ userEmail });
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string; statusCode: number; message: string }> {
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

    return {
      accessToken,
      statusCode: HttpStatus.OK,
      message: 'Login Successfully',
    };
  }

  async forgotPassword(
    Email: string,
  ): Promise<{ message: string; statusCode: number }> {
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

    return {
      message: 'Reset link sent. Check your email.',
      statusCode: HttpStatus.OK,
    };
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

    const resetLink = `http://192.168.137.1:3000/auth/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      html: `<p>You requested a password reset. Click the link below:</p>
             <p><a href="${resetLink}">${resetLink}</a></p>`,
    });
  }
}
