import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { LoginDto, Enable2FADto, LoginWith2FADto } from '../dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { firstName, secondName, lastName, secondLastName, email, password } =
      createUserDto;

    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    // Generar username automáticamente: primera letra nombre + primer apellido
    const username = (
      firstName.charAt(0) + lastName
    ).toLowerCase();

    // Verificar si el username ya existe
    const usernameExists = await this.userRepository.findOne({
      where: { username },
    });

    if (usernameExists) {
      throw new BadRequestException('El usuario ya existe');
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const user = this.userRepository.create({
      firstName,
      secondName,
      lastName,
      secondLastName,
      email,
      username,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    // Generar JWT
    const token = this.jwtService.sign(
      { sub: user.id, username: user.username },
      { expiresIn: '10m' },
    );

    return {
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
      },
      accessToken: token,
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Buscar usuario
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Si 2FA está habilitado, retornar token temporal
    if (user.twoFactorEnabled) {
      const tempToken = this.jwtService.sign(
        { sub: user.id, username: user.username, temp: true },
        { expiresIn: '5m' },
      );

      return {
        message: 'Se requiere autenticación de doble factor',
        accessToken: tempToken,
        requiresTwoFactor: true,
      };
    }

    // Generar JWT con duración de 10 minutos
    const token = this.jwtService.sign(
      { sub: user.id, username: user.username },
      { expiresIn: '10m' },
    );

    return {
      message: 'Login exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      accessToken: token,
    };
  }

  async generateTwoFactorSecret(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const secret = speakeasy.generateSecret({
      name: `SerPlantas (${user.email})`,
      issuer: 'SerPlantas',
      length: 32,
    });

    // Generar QR
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCode,
      message:
        'Escanea el código QR con Google Authenticator para habilitar 2FA',
    };
  }

  async enable2FA(userId: string, enable2FADto: Enable2FADto) {
    const { code } = enable2FADto;
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Aquí deberías tener guardado el secret temporal, por ahora lo generamos de nuevo
    // En producción, deberías guardar el secret en una columna temporal
    const isValidCode = speakeasy.totp.verify({
      secret: user.twoFactorSecret || '',
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!isValidCode) {
      throw new BadRequestException('Código 2FA inválido');
    }

    // Generar códigos de respaldo
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase(),
    );

    user.twoFactorEnabled = true;
    user.twoFactorBackupCodes = JSON.stringify(backupCodes);

    await this.userRepository.save(user);

    return {
      message: '2FA habilitado exitosamente',
      backupCodes: backupCodes,
      warning: 'Guarda estos códigos en un lugar seguro. Los necesitarás si pierdes acceso a tu autenticador.',
    };
  }

  async validateTwoFactor(userId: string, code: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA no está habilitado para este usuario');
    }

    // Verificar código TOTP
    const isValidCode = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (isValidCode) {
      const token = this.jwtService.sign(
        { sub: user.id, username: user.username },
        { expiresIn: '10m' },
      );

      return {
        message: 'Autenticación de doble factor exitosa',
        accessToken: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
    }

    // Verificar código de respaldo
    const backupCodes = JSON.parse(user.twoFactorBackupCodes || '[]');
    if (backupCodes.includes(code)) {
      // Remover código de respaldo usado
      const updatedCodes = backupCodes.filter((c) => c !== code);
      user.twoFactorBackupCodes = JSON.stringify(updatedCodes);
      await this.userRepository.save(user);

      const token = this.jwtService.sign(
        { sub: user.id, username: user.username },
        { expiresIn: '10m' },
      );

      return {
        message: 'Autenticación exitosa (código de respaldo usado)',
        accessToken: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
    }

    throw new UnauthorizedException('Código 2FA inválido');
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
