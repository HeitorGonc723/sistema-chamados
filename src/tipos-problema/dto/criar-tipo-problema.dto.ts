import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../common/transformers';

export class CriarTipoProblemaDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;
}
