import { PapelPessoa } from '../../generated/prisma/client.js';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Trim, TrimLower } from '../../common/transformers';

export class CriarPessoaDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  nome: string;

  @TrimLower()
  @IsEmail({}, { message: 'E-mail com formato inválido' })
  email: string;

  @IsEnum(PapelPessoa, { message: 'papel deve ser SOLICITANTE ou TECNICO' })
  papel: PapelPessoa;
}
