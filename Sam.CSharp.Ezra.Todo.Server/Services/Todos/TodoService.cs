using Microsoft.EntityFrameworkCore;
using Sam.CSharp.Ezra.Todo.Server.Models.Todos;

namespace Sam.CSharp.Ezra.Todo.Server.Services.Todos;

public interface ITodoService {
    Task<TodoDto> CreateAsync(CreateTodoRequest request, string userId);
    Task<TodoDto?> UpdateAsync(int id, UpdateTodoRequest request, string userId);
    Task<bool> DeleteAsync(int id, string userId);
    Task ReorderAsync(int listId, List<int> orderedIds, string userId);
}

public class TodoService(TodoDbContext context) : ITodoService {
    public async Task<TodoDto> CreateAsync(CreateTodoRequest request, string userId) {
        var listExists = await context.TodoLists.AnyAsync(l => l.Id == request.ListId && l.UserId == userId);
        if (!listExists) throw new UnauthorizedAccessException("List not found or access denied.");

        var maxOrder = await context.Todos
            .Where(t => t.UserId == userId && t.TodoListId == request.ListId)
            .MaxAsync(t => (int?)t.Order) ?? 0;

        var todo = new TodoItem {
            Value = request.Value,
            Order = maxOrder + 1,
            UserId = userId,
            TodoListId = request.ListId,
            IsCompleted = false
        };

        context.Todos.Add(todo);
        await context.SaveChangesAsync();
        return Map(todo);
    }

    public async Task<TodoDto?> UpdateAsync(int id, UpdateTodoRequest request, string userId) {
        var existing = await context.Todos.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (existing == null) return null;

        existing.Value = request.Value;
        existing.IsCompleted = request.IsCompleted;
        existing.Order = request.Order;

        await context.SaveChangesAsync();
        return Map(existing);
    }

    public async Task<bool> DeleteAsync(int id, string userId) {
        var existing = await context.Todos.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (existing == null) return false;

        context.Todos.Remove(existing);
        await context.SaveChangesAsync();
        return true;
    }

    // Updates the display order of todo items within a specific list.
    public async Task ReorderAsync(int listId, List<int> orderedIds, string userId) {
        var listExists = await context.TodoLists.AnyAsync(l => l.Id == listId && l.UserId == userId);
        if (!listExists) throw new UnauthorizedAccessException("List not found or access denied.");

        var todos = await context.Todos
            .Where(t => orderedIds.Contains(t.Id) && t.UserId == userId && t.TodoListId == listId)
            .ToListAsync();
        var todoMap = todos.ToDictionary(t => t.Id);

        for (var i = 0; i < orderedIds.Count; i++)
            if (todoMap.TryGetValue(orderedIds[i], out var todo))
                todo.Order = i + 1;

        await context.SaveChangesAsync();
    }

    private static TodoDto Map(TodoItem t) {
        return new TodoDto(t.Id, t.Value, t.IsCompleted, t.Order);
    }
}
