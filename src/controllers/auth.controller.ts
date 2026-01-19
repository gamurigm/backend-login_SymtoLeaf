import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { LoginDto, Enable2FADto, LoginWith2FADto } from '../dtos/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea un nuevo usuario con validación de datos. El username se genera automáticamente con la primera letra del nombre + apellido.',
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      example1: {
        summary: 'Usuario válido',
        value: {
          firstName: 'Juan',
          secondName: 'Carlos',
          lastName: 'González',
          secondLastName: 'Rodríguez',
          email: 'juan@example.com',
          password: 'Seguro123!',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Usuario registrado exitosamente',
    example: {
      message: 'Usuario registrado exitosamente',
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        username: 'jgonzález',
        email: 'juan@example.com',
        firstName: 'Juan',
      },
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o usuario ya existe',
    example: {
      statusCode: 400,
      message: 'El email ya está registrado',
      error: 'Bad Request',
    },
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Login con usuario y contraseña. Si 2FA está habilitado, retorna un token temporal.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      example1: {
        summary: 'Credenciales válidas',
        value: {
          username: 'jgonzález',
          password: 'Seguro123!',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Login exitoso',
    example: {
      message: 'Login exitoso',
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        username: 'jgonzález',
        email: 'juan@example.com',
      },
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas',
    example: {
      statusCode: 401,
      message: 'Credenciales inválidas',
    },
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('login-2fa')
  @HttpCode(HttpStatus.OK)
  @ApiTags('2FA')
  @ApiOperation({
    summary: 'Login con código 2FA',
    description:
      'Completa el login usando el código de 6 dígitos de Google Authenticator o un código de respaldo.',
  })
  @ApiBody({
    type: LoginWith2FADto,
    examples: {
      example1: {
        summary: 'Código TOTP válido',
        value: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          code: '123456',
        },
      },
      example2: {
        summary: 'Código de respaldo',
        value: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          code: 'ABCD1234',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Autenticación 2FA completada',
    example: {
      message: 'Autenticación de doble factor exitosa',
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        username: 'jgonzález',
        email: 'juan@example.com',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Código 2FA inválido',
    example: {
      statusCode: 401,
      message: 'Código 2FA inválido',
    },
  })
  async loginWith2FA(@Body() loginWith2FADto: LoginWith2FADto) {
    const { token, code } = loginWith2FADto;
    const payload = await this.authService.validateToken(token);

    return this.authService.validateTwoFactor(payload.sub, code);
  }

  @Get('2fa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiTags('2FA')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Obtener código QR para 2FA',
    description:
      'Genera un código QR que se puede escanear con Google Authenticator para habilitar 2FA.',
  })
  @ApiOkResponse({
    description: 'Código QR generado exitosamente',
    example: {
      secret: 'JBSWY3DPEBLW64TMMQ======',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
      message: 'Escanea el código QR con Google Authenticator',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token inválido o expirado',
  })
  async setup2FA(@Request() req) {
    return this.authService.generateTwoFactorSecret(req.user.sub);
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiTags('2FA')
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Habilitar 2FA',
    description:
      'Valida el código de 2FA y habilita la autenticación de doble factor. Retorna 10 códigos de respaldo.',
  })
  @ApiBody({
    type: Enable2FADto,
    examples: {
      example1: {
        summary: 'Código válido de Google Authenticator',
        value: {
          code: '123456',
        },
      },
    },
  })
  @ApiOkResponse({
    description: '2FA habilitado exitosamente',
    example: {
      message: '2FA habilitado exitosamente',
      backupCodes: [
        'ABCD1234',
        'EFGH5678',
        'IJKL9012',
        'MNOP3456',
        'QRST7890',
        'UVWX1234',
        'XYZA5678',
        'BCDE9012',
        'FGHI3456',
        'JKLM7890',
      ],
      warning: 'Guarda estos códigos en un lugar seguro',
    },
  })
  @ApiBadRequestResponse({
    description: 'Código 2FA inválido',
  })
  async enable2FA(@Request() req, @Body() enable2FADto: Enable2FADto) {
    return this.authService.enable2FA(req.user.sub, enable2FADto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Obtener perfil del usuario',
    description: 'Retorna la información del usuario autenticado.',
  })
  @ApiOkResponse({
    description: 'Perfil obtenido exitosamente',
    example: {
      message: 'Perfil obtenido exitosamente',
      user: {
        sub: '550e8400-e29b-41d4-a716-446655440000',
        username: 'jgonzález',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token inválido o expirado',
  })
  async getProfile(@Request() req) {
    return {
      message: 'Perfil obtenido exitosamente',
      user: req.user,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cerrar sesión',
    description: 'Invalida el token actual (cliente debe eliminar el token localmente).',
  })
  @ApiOkResponse({
    description: 'Logout exitoso',
    example: {
      message: 'Logout exitoso',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token inválido',
  })
  async logout() {
    return {
      message: 'Logout exitoso',
    };
  }
}
