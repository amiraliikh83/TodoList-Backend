import { InjectModel } from '@nestjs/mongoose';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MailService } from '../auth/services/mail.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private jwtService: JwtService, // اضافه کردن JwtService به سازنده
    @InjectModel(User.name) private userModel: Model<UserDocument>, // اضافه کردن مدل User برای ثبت‌نام کاربر
    private mailService: MailService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
      prompt: 'consent select_account',
    } as any);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const email = emails[0].value;

    let user = await this.userModel.findOne({ userEmail: email });

    if (!user) {
      // اگر کاربر وجود نداشت، اکانت بساز
      const randomPassword = Math.random().toString(36).slice(-8); // پسورد تصادفی
      const hashedPassword = await import('bcrypt').then((bcrypt) =>
        bcrypt.hash(randomPassword, 10),
      );

      user = await this.userModel.create({
        userName: name?.givenName || email.split('@')[0],
        userEmail: email,
        password: hashedPassword,
        profilePicture: photos?.[0]?.value, // اختیاری
        isGoogleUser: true, // پرچم برای گوگلf
      });

      // ارسال ایمیل با رمز عبور تصادفی
      await this.mailService.sendEmail({
        from: 'TaskOra', // ایمیل شما
        to: email, // ایمیل کاربر
        subject: 'Your new account details',
        text: `Your account has been created successfully! Here is your temporary password: ${randomPassword}`,
      } as any);
    }

    const payload = { email: user.userEmail, sub: user._id };
    const jwtToken = this.jwtService.sign(payload);

    done(null, { ...user.toObject(), jwtToken });
  }
}
