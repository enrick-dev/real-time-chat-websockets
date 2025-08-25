import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(50, { message: 'Nome deve ter no máximo 50 caracteres' })
  name: string;

  @IsEmail({}, { message: 'Email deve ser válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  @MaxLength(100, { message: 'Senha deve ter no máximo 100 caracteres' })
  password: string;
}
