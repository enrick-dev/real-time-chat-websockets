import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    this.logger.log(`Attempting to register user: ${registerDto.email}`, 'AuthService.register');

    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      this.logger.warn(`Registration failed: User already exists with email ${registerDto.email}`, 'AuthService.register');
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    this.logger.debug('Password hashed successfully', 'AuthService.register');

    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    this.logger.log(`User registered successfully: ${user.email} (ID: ${user.id})`, 'AuthService.register');
    return user;
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`Attempting login for user: ${loginDto.email}`, 'AuthService.login');

    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      this.logger.warn(`Login failed: User not found with email ${loginDto.email}`, 'AuthService.login');
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for user ${loginDto.email}`, 'AuthService.login');
      throw new UnauthorizedException('Password is incorrect');
    }

    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);
    
    this.logger.log(`User logged in successfully: ${user.email} (ID: ${user.id})`, 'AuthService.login');
    this.logger.debug(`JWT token generated for user: ${user.email}`, 'AuthService.login');

    return { access_token };
  }

  async validateUser(userId: string): Promise<any> {
    this.logger.debug(`Validating user: ${userId}`, 'AuthService.validateUser');
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (user) {
      this.logger.debug(`User validated successfully: ${userId}`, 'AuthService.validateUser');
    } else {
      this.logger.debug(`User validation failed: ${userId} not found`, 'AuthService.validateUser');
    }

    return user;
  }
}
