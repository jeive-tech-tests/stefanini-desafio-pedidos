# Frontend Angular - Gestão de Pedidos

Interface Angular da solução Stefanini, construída com PrimeNG e Tailwind CSS. A documentação completa da arquitetura, execução integrada, API e deploy está no [README principal](../../README.md).

## Executar localmente

Com a API disponível em `http://localhost:5152`:

```bash
npm ci
npm start
```

A aplicação fica disponível em `http://localhost:4200`, e o proxy encaminha `/api` para a API local.

## Qualidade

```bash
npm run format:check
npm run test:ci
npm run test:coverage
npm run build
npm audit --audit-level=high
```

## Estrutura

- `core`: configurações, interceptadores e serviços transversais;
- `layout`: shell e cabeçalho da aplicação;
- `shared/components`: design system `ui-*` que encapsula PrimeNG;
- `features/pedidos`: páginas, componentes, modelos e serviços da funcionalidade.

Criação, consulta e edição são apresentadas em modais roteáveis. A listagem oferece paginação e filtros combináveis por nome/e-mail do cliente, produto e pagamento.
