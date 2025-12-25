using Microsoft.EntityFrameworkCore;
using Sam.CSharp.Ezra.Todo.Server.Core;
using Sam.CSharp.Ezra.Todo.Server.Models.Todos;

namespace Sam.CSharp.Ezra.Todo.Server.Services.Todos;

public interface ITodoListService {
    Task<PagedResult<TodoListDto>> GetAllAsync(string userId, int page = 1, int pageSize = 10);
    Task<TodoListDto> CreateAsync(CreateTodoListRequest request, string userId);
    Task<TodoListDto?> UpdateAsync(int id, UpdateTodoListRequest request, string userId);
    Task<bool> DeleteAsync(int id, string userId);
    Task ReorderAsync(List<int> orderedIds, string userId);
}

public class TodoListService(TodoDbContext context) : ITodoListService {
    public async Task<PagedResult<TodoListDto>> GetAllAsync(string userId, int page = 1, int pageSize = 10) {
        var query = context.TodoLists.Include(l => l.Items).Where(l => l.UserId == userId);
        var totalCount = await query.CountAsync();
        var items = await query
            .OrderBy(l => l.Order)
            .ThenBy(l => l.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => Map(l))
            .ToListAsync();

        return new PagedResult<TodoListDto>(items, totalCount);
    }

    public async Task<TodoListDto> CreateAsync(CreateTodoListRequest request, string userId) {
        var list = new TodoList {
            Name = request.Name,
            UserId = userId,
            Items = []
        };

        context.TodoLists.Add(list);
        await context.SaveChangesAsync();
        return Map(list);
    }

    public async Task<TodoListDto?> UpdateAsync(int id, UpdateTodoListRequest request, string userId) {
        var existing = await context.TodoLists.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
        if (existing == null) return null;

        existing.Name = request.Name;

        await context.SaveChangesAsync();
        return Map(existing);
    }

    public async Task<bool> DeleteAsync(int id, string userId) {
        var existing = await context.TodoLists.FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
        if (existing == null) return false;

        context.TodoLists.Remove(existing);
        await context.SaveChangesAsync();
        return true;
    }

    // Updates the display order of todo lists based on the provided list of IDs.
    public async Task ReorderAsync(List<int> orderedIds, string userId) {
        var lists = await context.TodoLists.Where(l => l.UserId == userId).ToListAsync();
        for (var i = 0; i < orderedIds.Count; i++) {
            var list = lists.Find(l => l.Id == orderedIds[i]);
            if (list != null) list.Order = i;
        }

        await context.SaveChangesAsync();
    }

    private static TodoListDto Map(TodoList l) {
        return new TodoListDto(l.Id, l.Name,
            l.Items.OrderBy(t => t.Order).Select(t => new TodoDto(t.Id, t.Value, t.IsCompleted, t.Order)).ToList());
    }
}
