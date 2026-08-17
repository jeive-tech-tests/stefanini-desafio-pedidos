import { environment } from '../../../environments/environment';

export function apiEndpoint(resource: string): string {
  const base = environment.apiUrl.replace(/^\/+|\/+$/g, '');
  const path = resource.replace(/^\/+/, '');
  return new URL(`${base}/${path}`, document.baseURI).pathname;
}
