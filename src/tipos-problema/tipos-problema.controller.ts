import {
  Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post,
} from '@nestjs/common';
import { TiposProblemaService } from './tipos-problema.service';
import { CriarTipoProblemaDto } from './dto/criar-tipo-problema.dto';
import { AtualizarTipoProblemaDto } from './dto/atualizar-tipo-problema.dto';

@Controller('tipos-problema')
export class TiposProblemaController {
  constructor(private readonly service: TiposProblemaService) {}

  @Post()
  criar(@Body() dto: CriarTipoProblemaDto) {
    return this.service.criar(dto);
  }

  @Get()
  listar() {
    return this.service.listar();
  }

  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.service.buscar(id);
  }

  @Patch(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarTipoProblemaDto) {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.service.remover(id);
  }
}
