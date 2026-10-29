import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import { CriarTipoProblemaDto } from './dto/criar-tipo-problema.dto';
import { AtualizarTipoProblemaDto } from './dto/atualizar-tipo-problema.dto';

@Injectable()
export class TiposProblemaService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dto: CriarTipoProblemaDto) {
    try {
      return await this.prisma.tipoProblema.create({ data: dto });
    } catch (e) {
      this.tratarErro(e);
    }
  }

  listar() {
    return this.prisma.tipoProblema.findMany({ orderBy: { nome: 'asc' } });
  }

  async buscar(id: number) {
    const tipo = await this.prisma.tipoProblema.findUnique({ where: { id } });
    if (!tipo) throw new NotFoundException('Tipo de problema não encontrado');
    return tipo;
  }

  async atualizar(id: number, dto: AtualizarTipoProblemaDto) {
    await this.buscar(id);
    try {
      return await this.prisma.tipoProblema.update({ where: { id }, data: dto });
    } catch (e) {
      this.tratarErro(e);
    }
  }

  async remover(id: number) {
    await this.buscar(id);
    const usos = await this.prisma.chamado.count({ where: { tipoProblemaId: id } });
    if (usos > 0) {
      throw new ConflictException(
        'Tipo de problema já usado em chamados não pode ser removido; desative-o (PATCH ativo=false)',
      );
    }
    await this.prisma.tipoProblema.delete({ where: { id } });
  }

  private tratarErro(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ConflictException('Já existe um tipo de problema com esse nome');
    }
    throw e;
  }
}
