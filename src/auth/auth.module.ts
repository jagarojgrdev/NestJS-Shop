import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CommonModule } from 'src/common/common.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  //Importamos JwtStrategy
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    CommonModule,
    //Instalamos passport y jwt
    //npm install @nestjs/passport passport , npm install @nestjs/jwt passport-jwt y npm install -D @types/passport-jwt
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    // Ejemplo sincrono, es mejor realizarlo de manera asincrona
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: {
    //     expiresIn: '2h',
    //   },
    // }),

    //Ejemplo asincrono
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          //Habría que hacer las validaciones para la variable env
          secret: configService.get('JWT_SECRET'),
          //Especificamos tiempo de validez de token
          signOptions: {
            expiresIn: '2h',
          },
        };
      },
    }),
  ],
  //Exportamos módulos
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
