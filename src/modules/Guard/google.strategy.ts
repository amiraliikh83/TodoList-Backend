import { InjectModel } from '@nestjs/mongoose';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private jwtService: JwtService, // اضافه کردن JwtService به سازنده
    @InjectModel(User.name) private userModel: Model<UserDocument>, // اضافه کردن مدل User برای ثبت‌نام کاربر
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const email = emails[0].value;

    // بررسی که آیا کاربر در پایگاه داده وجود دارد یا خیر
    const user = await this.userModel.findOne({ userEmail: email });

    if (!user) {
      // اگر کاربر موجود نبود، به او پیغام ثبت‌نام بدهید
      return done(
        new UnauthorizedException('User not found, please register first'),
        false,
      );
    }

    // اگر کاربر موجود بود، توکن JWT بسازید و به او بدهید
    const payload = { email: user.userEmail, sub: user._id };
    const jwtToken = this.jwtService.sign(payload);

    // ارسال توکن به کاربر
    user.jwtToken = jwtToken; // ذخیره توکن برای کاربر (اختیاری)
    done(null, { ...user.toObject(), jwtToken }); // اطلاعات کاربر و توکن را ارسال کنید
  }
}
