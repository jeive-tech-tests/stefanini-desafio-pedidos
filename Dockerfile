FROM node:24-alpine AS frontend-build
WORKDIR /src/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS api-build
WORKDIR /src

COPY src/Stefanini.Pedidos.Domain/Stefanini.Pedidos.Domain.csproj src/Stefanini.Pedidos.Domain/
COPY src/Stefanini.Pedidos.Application/Stefanini.Pedidos.Application.csproj src/Stefanini.Pedidos.Application/
COPY src/Stefanini.Pedidos.Infrastructure/Stefanini.Pedidos.Infrastructure.csproj src/Stefanini.Pedidos.Infrastructure/
COPY src/Stefanini.Pedidos.Api/Stefanini.Pedidos.Api.csproj src/Stefanini.Pedidos.Api/
RUN dotnet restore src/Stefanini.Pedidos.Api/Stefanini.Pedidos.Api.csproj

COPY src/ ./src/
RUN dotnet publish src/Stefanini.Pedidos.Api/Stefanini.Pedidos.Api.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=api-build /app/publish ./
COPY --from=frontend-build /src/frontend/dist/stefanini-pedidos-web/browser ./wwwroot

ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

USER $APP_UID
ENTRYPOINT ["dotnet", "Stefanini.Pedidos.Api.dll"]
