import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PapelPessoa, Prisma, Prioridade, StatusChamado } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import { CriarChamadoDto } from './dto/criar-chamado.dto';
import { AtualizarChamadoDto } from './dto/atualizar-chamado.dto';
import { FiltroChamadosDto } from './dto/filtro-chamados.dto';
import { CriarComentarioDto } from './dto/criar-comentario.dto';

const LIMITE_ATENDIMENTOS = 5;

const TRANSICOES: Record<StatusChamado, StatusChamado[]> = {
  ABERTO: [StatusChamado.CANCELADO],
  EM_ATENDIMENTO: [StatusChamado.RESOLVIDO, StatusChamado.CANCELADO],
  RESOLVIDO: [StatusChamado.FECHADO, StatusChamado.EM_ATENDIMENTO],
  FECHADO: [],
  CANCELADO: [],
};

const RELACOES = {
  solicitante: { select: { id: true, nome: true, email: true } },
  tecnico: { select: { id: true, nome: true, email: true } },
  tipoProblema: true,
} satisfies Prisma.ChamadoInclude;

@Injectable()
export class ChamadosService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- abrir ----------
  async criar(dto: CriarChamadoDto) {
    const solicitante = await this.prisma.pessoa.findUnique({
      where: { id: dto.solicitanteId },
    });
    if (!solicitante) throw new NotFoundException('Solicitante não encontrado');
    if (solicitante.papel !== PapelPessoa.SOLICITANTE) {
      throw new UnprocessableEntityException('Quem abre o chamado deve ser um solicitante');
    }
    if (!solicitante.ativo) {
      throw new UnprocessableEntityException('Pessoa inativa não pode abrir chamados');
    }

    await this.validarTipoAtivo(this.prisma, dto.tipoProblemaId);

    return this.prisma.chamado.create({
      data: {
        titulo: dto.titulo,
        descricao: dto.descricao,
        prioridade: dto.prioridade ?? Prioridade.MEDIA,
        status: StatusChamado.ABERTO,
        solicitanteId: dto.solicitanteId,
        tipoProblemaId: dto.tipoProblemaId,
      },
      include: RELACOES,
    });
  }

  // ---------- consultar ----------
  listar(filtro: FiltroChamadosDto) {
    return this.prisma.chamado.findMany({
      where: {
        status: filtro.status,
        prioridade: filtro.prioridade,
        tipoProblemaId: filtro.tipoProblemaId,
        tecnicoId: filtro.tecnicoId,
      },
      include: RELACOES,
      orderBy: { criadoEm: 'desc' },
    });
  }

  async buscar(id: number) {
    const chamado = await this.prisma.chamado.findUnique({
      where: { id },
      include: {
        ...RELACOES,
        comentarios: {
          orderBy: { criadoEm: 'asc' },
          include: { autor: { select: { id: true, nome: true, papel: true } } },
        },
      },
    });
    if (!chamado) throw new NotFoundException('Chamado não encontrado');
    return chamado;
  }

  // ---------- alterar dados ----------
  async atualizar(id: number, dto: AtualizarChamadoDto) {
    const chamado = await this.obter(this.prisma, id);
    this.garantirNaoEncerrado(chamado.status);
    if (dto.tipoProblemaId !== undefined) {
      await this.validarTipoAtivo(this.prisma, dto.tipoProblemaId);
    }
    return this.prisma.chamado.update({
      where: { id },
      data: dto,
      include: RELACOES,
    });
  }

  // ---------- designar técnico ----------
  designarTecnico(id: number, tecnicoId: number) {
    return this.prisma.$transaction(async (tx) => {
      const chamado = await this.obter(tx, id);
      this.garantirNaoEncerrado(chamado.status);

      if (chamado.status === StatusChamado.RESOLVIDO) {
        throw new UnprocessableEntityException(
          'Chamado resolvido não aceita nova designação; reabra-o (EM_ATENDIMENTO) antes',
        );
      }

      const tecnico = await tx.pessoa.findUnique({ where: { id: tecnicoId } });
      if (!tecnico) throw new NotFoundException('Técnico não encontrado');
      if (tecnico.papel !== PapelPessoa.TECNICO) {
        throw new UnprocessableEntityException('Apenas um técnico pode ser designado');
      }
      if (!tecnico.ativo) {
        throw new UnprocessableEntityException('Técnico inativo não pode ser designado');
      }
      if (tecnico.id === chamado.solicitanteId) {
        throw new UnprocessableEntityException('Ninguém pode atender o próprio chamado');
      }

      await this.verificarLimite(tx, tecnicoId, id);

      // Aberto -> Em atendimento automaticamente; se já estava em atendimento, apenas troca o técnico.
      return tx.chamado.update({
        where: { id },
        data: { tecnicoId, status: StatusChamado.EM_ATENDIMENTO },
        include: RELACOES,
      });
    });
  }

  // ---------- mudar situação ----------
  alterarStatus(id: number, novo: StatusChamado) {
    return this.prisma.$transaction(async (tx) => {
      const chamado = await this.obter(tx, id);
      this.garantirNaoEncerrado(chamado.status);

      if (chamado.status === StatusChamado.ABERTO && novo === StatusChamado.EM_ATENDIMENTO) {
        throw new UnprocessableEntityException(
          'Um chamado aberto só entra em atendimento ao designar um técnico (POST /chamados/:id/tecnico)',
        );
      }
      if (!TRANSICOES[chamado.status].includes(novo)) {
        throw new UnprocessableEntityException(
          `Transição proibida: ${chamado.status} → ${novo}`,
        );
      }

      // Reabrir (Resolvido -> Em atendimento) também respeita o limite do técnico.
      if (novo === StatusChamado.EM_ATENDIMENTO && chamado.tecnicoId) {
        await this.verificarLimite(tx, chamado.tecnicoId, id);
      }

      let resolvidoEm: Date | null | undefined;
      if (novo === StatusChamado.RESOLVIDO) resolvidoEm = new Date();
      if (novo === StatusChamado.EM_ATENDIMENTO) resolvidoEm = null;

      return tx.chamado.update({
        where: { id },
        data: { status: novo, resolvidoEm },
        include: RELACOES,
      });
    });
  }

  // ---------- comentar ----------
  async comentar(chamadoId: number, dto: CriarComentarioDto) {
    const chamado = await this.obter(this.prisma, chamadoId);
    this.garantirNaoEncerrado(chamado.status);

    const autor = await this.prisma.pessoa.findUnique({ where: { id: dto.autorId } });
    if (!autor) throw new NotFoundException('Autor não encontrado');
    if (!autor.ativo) {
      throw new UnprocessableEntityException('Pessoa inativa não pode comentar');
    }
    if (autor.id !== chamado.solicitanteId && autor.id !== chamado.tecnicoId) {
      throw new ForbiddenException(
        'Só o solicitante e o técnico responsável podem comentar neste chamado',
      );
    }

    return this.prisma.comentario.create({
      data: { chamadoId, autorId: autor.id, texto: dto.texto },
    });
  }

  // ---------- auxiliares ----------
  private async obter(db: Prisma.TransactionClient | PrismaService, id: number) {
    const chamado = await db.chamado.findUnique({ where: { id } });
    if (!chamado) throw new NotFoundException('Chamado não encontrado');
    return chamado;
  }

  private garantirNaoEncerrado(status: StatusChamado) {
    if (status === StatusChamado.FECHADO || status === StatusChamado.CANCELADO) {
      throw new UnprocessableEntityException(
        'Chamado fechado ou cancelado está encerrado e não pode ser alterado',
      );
    }
  }

  private async validarTipoAtivo(
    db: Prisma.TransactionClient | PrismaService,
    tipoProblemaId: number,
  ) {
    const tipo = await db.tipoProblema.findUnique({ where: { id: tipoProblemaId } });
    if (!tipo) throw new NotFoundException('Tipo de problema não encontrado');
    if (!tipo.ativo) {
      throw new UnprocessableEntityException('Tipo de problema desativado');
    }
  }

  /** Trava a linha do técnico para evitar que duas requisições simultâneas passem do limite. */
  private async verificarLimite(
    tx: Prisma.TransactionClient,
    tecnicoId: number,
    ignorarChamadoId: number,
  ) {
    await tx.$queryRaw`SELECT id FROM pessoas WHERE id = ${tecnicoId} FOR UPDATE`;
    const emAtendimento = await tx.chamado.count({
      where: {
        tecnicoId,
        status: StatusChamado.EM_ATENDIMENTO,
        id: { not: ignorarChamadoId },
      },
    });
    if (emAtendimento >= LIMITE_ATENDIMENTOS) {
      throw new UnprocessableEntityException(
        `O técnico já tem ${LIMITE_ATENDIMENTOS} chamados em atendimento`,
      );
    }
  }
}
