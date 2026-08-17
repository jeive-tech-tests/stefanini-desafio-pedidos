import { HttpErrorResponse } from '@angular/common/http';
import { mensagemErroHttp } from './http-error';

describe('mensagemErroHttp', () => {
  it('retorna mensagem de conexão quando a API está indisponível', () => {
    const error = new HttpErrorResponse({ status: 0 });

    expect(mensagemErroHttp(error)).toContain('conectar à API');
  });

  it('prioriza a primeira mensagem de validação', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        title: 'Falha de validação',
        errors: { NomeCliente: ['O nome é obrigatório.'] },
      },
    });

    expect(mensagemErroHttp(error)).toBe('O nome é obrigatório.');
  });

  it('usa detalhe, título e status como alternativas', () => {
    expect(
      mensagemErroHttp(
        new HttpErrorResponse({ status: 404, error: { detail: 'Não encontrado.' } }),
      ),
    ).toBe('Não encontrado.');
    expect(
      mensagemErroHttp(new HttpErrorResponse({ status: 409, error: { title: 'Conflito.' } })),
    ).toBe('Conflito.');
    expect(mensagemErroHttp(new HttpErrorResponse({ status: 503, error: {} }))).toContain('503');
  });

  it('trata erros que não são respostas HTTP', () => {
    expect(mensagemErroHttp(new Error('falha'))).toContain('Tente novamente');
  });
});
