import { Prioridade, StatusChamado } from '../../generated/prisma/client.js';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';

export class FiltroChamadosDto {
  @IsOptional()
  @IsEnum(StatusChamado)
  status?: StatusChamado;

  @IsOptional()
  @IsEnum(Prioridade)
  prioridade?: Prioridade;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tipoProblemaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tecnicoId?: number;
}
