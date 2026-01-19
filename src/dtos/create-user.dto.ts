import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Primer nombre del usuario',
    example: 'Juan',
  })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Segundo nombre del usuario',
    example: 'Carlos',
  })
  @IsNotEmpty()
  secondName: string;

  @ApiProperty({
    description: 'Primer apellido del usuario',
    example: 'González',
  })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Segundo apellido del usuario',
    example: 'Rodríguez',
  })
  @IsNotEmpty()
  secondLastName: string;

  @ApiProperty({
    description: 'Email único del usuario',
    example: 'juan@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Contraseña (8+ caracteres, mayúscula, minúscula, número o especial)',
    example: 'Seguro123!',
  })
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe contener mayúsculas, minúsculas, números o caracteres especiales',
  })
  password: string;
}
