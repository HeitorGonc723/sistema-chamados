import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../common/transformers';

export class AtualizarTipoProblemaDto {
  @IsOptional()
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
