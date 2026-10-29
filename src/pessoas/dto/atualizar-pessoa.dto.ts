import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Trim, TrimLower } from '../../common/transformers';

export class AtualizarPessoaDto {
  @IsOptional()
  @Trim()
  @IsString()
  @IsNotEmpty()
  nome?: string;

  @IsOptional()
  @TrimLower()
  @IsEmail({}, { message: 'E-mail com formato inválido' })
  email?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
