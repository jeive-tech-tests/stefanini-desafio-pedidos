namespace Stefanini.Pedidos.Application.Exceptions;

public sealed class NotFoundException(string message) : Exception(message);
