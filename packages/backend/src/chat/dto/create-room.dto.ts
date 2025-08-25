import { IsString, MinLength, MaxLength, IsInt, Min, Max } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @MinLength(2, { message: 'Nome da sala deve ter pelo menos 2 caracteres' })
  @MaxLength(50, { message: 'Nome da sala deve ter no máximo 50 caracteres' })
  name: string;

  @IsInt()
  @Min(2, { message: 'Limite mínimo de usuários é 2' })
  @Max(100, { message: 'Limite máximo de usuários é 100' })
  maxUsers: number;
}
