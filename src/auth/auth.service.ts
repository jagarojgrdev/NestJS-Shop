import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ExceptionService } from 'src/common/services/exception.service';

import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly exceptionService: ExceptionService,
    private readonly jwtService: JwtService,
  ) {}

  //Instalamos bcrypt npm install bcrypt y npm install -D @types/bcrypt
  //Importamos bcryps manualmente
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        //Hasheamos password
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);

      return { ...user, token: this.getJwtToken({ id: user.id }) };
    } catch (error) {
      this.exceptionService.handleException(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    //Devolvemos usuario cuando por el email e indicamos que campos devolver
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    //Si no existe el email
    if (!user)
      throw new UnauthorizedException(`Credentials are not valid (email)`);

    //Validamos que las credenciales sean válidas
    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException(`Credentials are not valid (password)`);

    return { ...user, token: this.getJwtToken({ id: user.id }) };
  }

  checkAuthStatus(user: User) {
    return { ...user, token: this.getJwtToken({ id: user.id }) };
  }

  //Generamos jwt firmando el payload
  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
