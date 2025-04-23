import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
  Query,
  Res,
  Redirect,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { LoginUserDto } from '../../dto/login-user.dto';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/Guard/JwtAuthGuard';
import { AuthGuard } from '@nestjs/passport';
import { VerifyCodeDto } from 'src/modules/DTO/verify-code.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async startRegister(@Body() dto: CreateUserDto) {
    await this.authService.startRegistration(dto);
    return {
      message: 'Verification code sent to your email',
      statusCode: HttpStatus.OK,
    };
  }

  @Post('confirm')
  async confirm(@Body() body: { userEmail: string; code: string }) {
    await this.authService.confirmRegistration(body.userEmail, body.code);
    return {
      message: 'Account created successfully',
      statusCode: HttpStatus.CREATED,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string; statusCode: number }> {
    console.log('Received login request:', loginUserDto);

    if (!loginUserDto.password) {
      throw new BadRequestException('Password is required');
    }

    return this.authService.login(loginUserDto);
  }
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // رد می‌کنه به گوگل
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    // کاربر احراز شده اینجاست
    return req.user;
  }
  @Get('validate-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Token is valid.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  validateToken(@Request() req): {
    message: string;
    user: any;
    statusCode: number;
  } {
    return {
      message: 'Token is valid.',
      user: req.user.username,
      statusCode: HttpStatus.OK,
    };
  }
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Password reset email sent.' })
  async forgotPassword(@Body('Email') Email: string) {
    return this.authService.forgotPassword(Email);
  }

  @Get('reset-password')
  @Redirect()
  getResetPasswordPage(@Query('token') token: string) {
    return {
      url: `/public/reset-password.html?token=${token}`,
      statusCode: 302,
    };
  }

  @Post('reset-password-submit')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Password successfully reset.' })
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }
}
