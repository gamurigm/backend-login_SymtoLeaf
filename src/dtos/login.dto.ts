import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Username del usuario (autogenerado: letra + apellido)',
    example: 'jgonzález',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'Seguro123!',
  })
  @IsNotEmpty()
  password: string;
}

export class LoginWith2FADto {
  @ApiProperty({
    description: 'Token temporal recibido del login (si 2FA está habilitado)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Código de 6 dígitos de Google Authenticator o código de respaldo',
    example: '123456',
  })
  @IsNotEmpty()
  code: string;
}

export class Enable2FADto {
  @ApiProperty({
    description: 'Código de 6 dígitos de Google Authenticator',
    example: '123456',
  })
  @IsNotEmpty()
  code: string;
}
