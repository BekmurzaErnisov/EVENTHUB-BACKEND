import { Module } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService, JwtStrategy } from './auth.service';
import { AuthController } from './auth.controller';

export class JwtAuthGuard extends AuthGuard('jwt') {}

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
