import { Prioridade } from '../../generated/prisma/client.js';
import { IsEnum, IsInt, IsOptional, IsString, Length, MinLength } from 'class-validator';
import { Trim } from '../../common/transformers';

export class AtualizarChamadoDto {
  @IsOptional()
  @Trim()
  @IsString()
  @Length(5, 100, { message: 'titulo deve ter entre 5 e 100 caracteres' })
  titulo?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(10, { message: 'descricao deve ter no mínimo 10 caracteres' })
  descricao?: string;

  @IsOptional()
  @IsEnum(Prioridade)
  prioridade?: Prioridade;

  @IsOptional()
  @IsInt()
  tipoProblemaId?: number;
}
