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
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { LoginUserDto } from '../../dto/login-user.dto';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/Guard/JwtAuthGuard';
import path from 'path';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    return this.authService.login(loginUserDto);
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
  @Redirect('/public/reset-password.html')
  getResetPasswordPage(@Query('token') token: string, @Res() res: Response) {
    return;
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
