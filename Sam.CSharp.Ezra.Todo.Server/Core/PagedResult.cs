namespace Sam.CSharp.Ezra.Todo.Server.Core;

public record PagedResult<T>(List<T> Items, int TotalCount);
