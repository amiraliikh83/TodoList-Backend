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
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { LoginUserDto } from '../../dto/login-user.dto';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/Guard/JwtAuthGuard';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ message: string; statusCode: number }> {
    await this.authService.register(createUserDto);
    return {
      message: 'User registered successfully.',
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
  async googleAuth(@Req() req) {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const googleUser = req.user;

    const user = await this.authService.findByEmail(googleUser.email); // این تابع باید باشه

    if (!user) {
      return res
        .status(403)
        .json({ message: 'اکانتی با این ایمیل وجود نداره!' });
    }

    const payload = { sub: user._id, email: user.userEmail };
    const token = this.jwtService.sign(payload);

    return res.json({ token });
  }
  @UseGuards(JwtAuthGuard)
  @Get('validate-token')
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
