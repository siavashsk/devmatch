import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    // this will make the post repository available for injection
    // available in the current scope
    TypeOrmModule.forFeature([User]),
    PassportModule,
    // configure
    JwtModule.register({  })
  ],
  controllers: [AuthController],
  providers: [AuthService], // jwt strategy, roles guard
  exports: [AuthService] // roles guard -> todo
})
export class AuthModule {}
