import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../common/transformers';

export class CriarComentarioDto {
  @IsInt()
  autorId: number;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'O comentário não pode ser vazio' })
  texto: string;
}
