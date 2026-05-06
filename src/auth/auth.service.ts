import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Email already in use! Please try with a diff email',
      );
    }

    const hashedPassword = await this.hashPassword(registerDto.password);
    const newlyCreatedUser = this.usersRepository.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
      role: UserRole.USER,
    });

    const saveUser = await this.usersRepository.save(newlyCreatedUser);

    const { password, ...result } = saveUser;
    return {
      user: result,
      message: 'Registration successfully done! Please login to continue',
    };
  }

  async createAdmim(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Email already in use! Please try with a diff email',
      );
    }

    const hashedPassword = await this.hashPassword(registerDto.password);
    const newlyCreatedUser = this.usersRepository.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    const saveUser = await this.usersRepository.save(newlyCreatedUser);

    const { password, ...result } = saveUser;
    return {
      user: result,
      message: 'Admin user created successfully! Please login to continue',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (
      !user ||
      !(await this.verifyPassword(loginDto.password, user.password))
    ) {
      throw new UnauthorizedException(
        'Invalid credentials or account not exists',
      );
    }

    const tokens = this.generateTokens(user);
    const { password, ...result } = user;
    return {
      user: result,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: 'refresh_secret',
      });

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const accessToken = this.generateAccessToken(user);
      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Find the current user by ID
  

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private async generateTokens(user: User) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  private generateAccessToken(user: User): string {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: 'jwt_secret',
      expiresIn: '15m',
    });
  }

  private generateRefreshToken(user: User): string {
    const payload = {
      sub: user.id,
    };

    return this.jwtService.sign(payload, {
      secret: 'refresh_secret',
      expiresIn: '15m',
    });
  }
}
