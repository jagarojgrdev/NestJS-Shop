import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto/index';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { GetUser, RawHeaders, RoleProtected, Auth } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  CheckAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    //Devulve todo el contenido de la petición
    // @Req() request: Express.Request,
    //llamamos decorador GetUser
    @GetUser() user: User,
    //Llamamos decorador GetUser indicandole un paraemtro
    @GetUser('email') userEmail: string,
    //Llamamos decorardor para devolver raw headers
    @RawHeaders() rawHeaders: string[],
  ) {
    return {
      ok: true,
      message: 'Hello world',
      user,
      userEmail,
      rawHeaders,
    };
  }

  @Get('private2')
  // Sirve para añadir información extra
  // @SetMetadata('roles', ['admin', 'super-admin'])
  //Aqui asignamos los roles necesarios
  @RoleProtected(ValidRoles.superAdmin)
  //Añadimos el guard propio para controlar roles
  //AuthGuard = Autorización || UserRoleGuard = Autenticación
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(
    @GetUser()
    user: User,
  ) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  //LLamamos decorador Auth
  @Auth(ValidRoles.admin)
  privateRoute3(
    @GetUser()
    user: User,
  ) {
    return {
      ok: true,
      user,
    };
  }
}
