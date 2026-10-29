import {
  Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post,
} from '@nestjs/common';
import { PessoasService } from './pessoas.service';
import { CriarPessoaDto } from './dto/criar-pessoa.dto';
import { AtualizarPessoaDto } from './dto/atualizar-pessoa.dto';

@Controller('pessoas')
export class PessoasController {
  constructor(private readonly service: PessoasService) {}

  @Post()
  criar(@Body() dto: CriarPessoaDto) {
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
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarPessoaDto) {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id', ParseIntPipe) id: number) {
    return this.service.remover(id);
  }
}
