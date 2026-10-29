import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ChamadosService } from './chamados.service';
import { CriarChamadoDto } from './dto/criar-chamado.dto';
import { AtualizarChamadoDto } from './dto/atualizar-chamado.dto';
import { FiltroChamadosDto } from './dto/filtro-chamados.dto';
import { DesignarTecnicoDto } from './dto/designar-tecnico.dto';
import { AlterarStatusDto } from './dto/alterar-status.dto';
import { CriarComentarioDto } from './dto/criar-comentario.dto';

@Controller('chamados')
export class ChamadosController {
  constructor(private readonly service: ChamadosService) {}

  @Post()
  criar(@Body() dto: CriarChamadoDto) {
    return this.service.criar(dto);
  }

  @Get()
  listar(@Query() filtro: FiltroChamadosDto) {
    return this.service.listar(filtro);
  }

  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscar(id);
  }

  @Patch(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarChamadoDto) {
    return this.service.atualizar(id, dto);
  }

  @Post(':id/tecnico')
  designarTecnico(@Param('id', ParseIntPipe) id: number, @Body() dto: DesignarTecnicoDto) {
    return this.service.designarTecnico(id, dto.tecnicoId);
  }

  @Patch(':id/status')
  alterarStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: AlterarStatusDto) {
    return this.service.alterarStatus(id, dto.status);
  }

  @Post(':id/comentarios')
  comentar(@Param('id', ParseIntPipe) id: number, @Body() dto: CriarComentarioDto) {
    return this.service.comentar(id, dto);
  }
}
