import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { LoginUserDto } from '../../dto/login-user.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

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
}
