namespace Sam.CSharp.Ezra.Todo.Server.Models.Todos;

public class TodoItem {
    public int Id { get; init; }
    public string? UserId { get; init; }
    public int Order { get; set; }
    public int TodoListId { get; init; }
    public required string Value { get; set; }
    public bool IsCompleted { get; set; }
}

public class TodoList {
    public int Id { get; init; }
    public string Name { get; set; } = string.Empty;
    public int Order { get; set; }
    public string? UserId { get; init; }
    public List<TodoItem> Items { get; init; } = [];
}
