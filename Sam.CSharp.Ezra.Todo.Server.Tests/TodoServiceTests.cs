using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Sam.CSharp.Ezra.Todo.Server.Models.Todos;
using Sam.CSharp.Ezra.Todo.Server.Services.Todos;

namespace Sam.CSharp.Ezra.Todo.Server.Tests;

public class TodoServiceTests {
    private const string TEST_USER_ID = "test-user";
    private readonly TodoDbContext _context;
    private readonly ITodoService _service;
    private readonly int _testListId;

    public TodoServiceTests() {
        var services = new ServiceCollection();
        services.AddTodoServices(true);
        var serviceProvider = services.BuildServiceProvider();

        _context = serviceProvider.GetRequiredService<TodoDbContext>();
        _service = serviceProvider.GetRequiredService<ITodoService>();

        var list = new TodoList { Name = "Test List", UserId = TEST_USER_ID };
        _context.TodoLists.Add(list);
        _context.SaveChanges();
        _testListId = list.Id;
    }


    [Fact]
    public async Task CreateAsync_AddsTodo() {
        var request = new CreateTodoRequest("Test Todo", _testListId);
        var created = await _service.CreateAsync(request, TEST_USER_ID);

        Assert.NotEqual(0, created.Id);
        Assert.Equal("Test Todo", created.Value);

        var inDb = await _context.Todos.FindAsync(created.Id);
        Assert.NotNull(inDb);
        Assert.Equal(TEST_USER_ID, inDb.UserId);
        Assert.Equal(_testListId, inDb.TodoListId);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesExistingTodo() {
        var createRequest = new CreateTodoRequest("Original", _testListId);
        var todo = await _service.CreateAsync(createRequest, TEST_USER_ID);

        var updateRequest = new UpdateTodoRequest("Updated", true, todo.Order);
        var result = await _service.UpdateAsync(todo.Id, updateRequest, TEST_USER_ID);

        Assert.NotNull(result);
        Assert.Equal("Updated", result.Value);
        Assert.True(result.IsCompleted);
    }

    [Fact]
    public async Task DeleteAsync_RemovesTodo() {
        var createRequest = new CreateTodoRequest("To Delete", _testListId);
        var todo = await _service.CreateAsync(createRequest, TEST_USER_ID);

        var result = await _service.DeleteAsync(todo.Id, TEST_USER_ID);
        Assert.True(result);

        var inDb = await _context.Todos.FindAsync(todo.Id);
        Assert.Null(inDb);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsNull_WhenNotExists() {
        var updateRequest = new UpdateTodoRequest("Updated", false, 0);
        var result = await _service.UpdateAsync(999, updateRequest, TEST_USER_ID);
        Assert.Null(result);
    }

    [Fact]
    public async Task ReorderAsync_UpdatesOrders() {
        var t1 = await _service.CreateAsync(new CreateTodoRequest("T1", _testListId), TEST_USER_ID);
        var t2 = await _service.CreateAsync(new CreateTodoRequest("T2", _testListId), TEST_USER_ID);

        await _service.ReorderAsync(_testListId, [t2.Id, t1.Id], TEST_USER_ID);

        var todos = await _context.Todos
            .Where(t => t.TodoListId == _testListId)
            .OrderBy(t => t.Order)
            .ToListAsync();

        Assert.Equal(t2.Id, todos[0].Id);
        Assert.Equal(1, todos[0].Order);
        Assert.Equal(t1.Id, todos[1].Id);
        Assert.Equal(2, todos[1].Order);
    }

    [Fact]
    public async Task CreateAsync_ThrowsUnauthorized_WhenListDoesNotBelongToUser() {
        var otherUserId = "other-user";
        var otherList = new TodoList { Name = "Other List", UserId = otherUserId };
        _context.TodoLists.Add(otherList);
        await _context.SaveChangesAsync();

        var request = new CreateTodoRequest("Test Todo", otherList.Id);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.CreateAsync(request, TEST_USER_ID));
    }
}
