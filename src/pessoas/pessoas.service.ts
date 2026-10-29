import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import { CriarPessoaDto } from './dto/criar-pessoa.dto';
import { AtualizarPessoaDto } from './dto/atualizar-pessoa.dto';

@Injectable()
export class PessoasService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dto: CriarPessoaDto) {
    try {
      return await this.prisma.pessoa.create({ data: dto });
    } catch (e) {
      this.tratarErro(e);
    }
  }

  listar() {
    return this.prisma.pessoa.findMany({ orderBy: { nome: 'asc' } });
  }

  async buscar(id: number) {
    const pessoa = await this.prisma.pessoa.findUnique({ where: { id } });
    if (!pessoa) throw new NotFoundException('Pessoa não encontrada');
    return pessoa;
  }

  async atualizar(id: number, dto: AtualizarPessoaDto) {
    await this.buscar(id);
    try {
      return await this.prisma.pessoa.update({ where: { id }, data: dto });
    } catch (e) {
      this.tratarErro(e);
    }
  }

  async remover(id: number) {
    await this.buscar(id);
    const [chamados, comentarios] = await Promise.all([
      this.prisma.chamado.count({
        where: { OR: [{ solicitanteId: id }, { tecnicoId: id }] },
      }),
      this.prisma.comentario.count({ where: { autorId: id } }),
    ]);
    if (chamados + comentarios > 0) {
      throw new ConflictException(
        'Pessoa já envolvida em chamados não pode ser removida; desative-a (PATCH ativo=false)',
      );
    }
    await this.prisma.pessoa.delete({ where: { id } });
  }

  private tratarErro(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ConflictException('E-mail já cadastrado');
    }
    throw e;
  }
}
