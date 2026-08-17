import { HttpErrorResponse } from '@angular/common/http';

interface ProblemDetails {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

export function mensagemErroHttp(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Não foi possível concluir a operação. Tente novamente.';
  }

  if (error.status === 0) {
    return 'Não foi possível conectar à API. Verifique se o backend está em execução.';
  }

  const problem = error.error as ProblemDetails | null;
  const validationMessage = problem?.errors
    ? Object.values(problem.errors).flat().at(0)
    : undefined;

  return (
    validationMessage ??
    problem?.detail ??
    problem?.title ??
    `A operação falhou com o status ${error.status}.`
  );
}
