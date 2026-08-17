export function apiUrl(recurso: string): string {
  const caminho = recurso.replace(/^\/+/, '');
  return new URL(`api/${caminho}`, document.baseURI).pathname;
}
