import { StatusChamado } from '../../generated/prisma/client.js';
import { IsEnum } from 'class-validator';

export class AlterarStatusDto {
  @IsEnum(StatusChamado)
  status: StatusChamado;
}
