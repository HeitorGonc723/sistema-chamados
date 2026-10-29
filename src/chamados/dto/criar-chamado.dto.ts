import { Prioridade } from '../../generated/prisma/client.js';
import { IsEnum, IsInt, IsOptional, IsString, Length, MinLength } from 'class-validator';
import { Trim } from '../../common/transformers';

export class CriarChamadoDto {
  @Trim()
  @IsString()
  @Length(5, 100, { message: 'titulo deve ter entre 5 e 100 caracteres' })
  titulo: string;

  @Trim()
  @IsString()
  @MinLength(10, { message: 'descricao deve ter no mínimo 10 caracteres' })
  descricao: string;

  @IsOptional()
  @IsEnum(Prioridade, { message: 'prioridade deve ser BAIXA, MEDIA, ALTA ou CRITICA' })
  prioridade?: Prioridade;

  @IsInt()
  solicitanteId: number;

  @IsInt()
  tipoProblemaId: number;
}
