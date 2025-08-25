import { IsString, IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email deve ser válido' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'Senha é obrigatória' })
  password: string;
}
