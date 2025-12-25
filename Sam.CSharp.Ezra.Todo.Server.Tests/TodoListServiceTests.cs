using Microsoft.Extensions.DependencyInjection;
using Sam.CSharp.Ezra.Todo.Server.Services.Todos;

namespace Sam.CSharp.Ezra.Todo.Server.Tests;

public class TodoListServiceTests {
    private const string TEST_USER_ID = "test-user";
    private readonly TodoDbContext _context;
    private readonly ITodoListService _service;

    public TodoListServiceTests() {
        var services = new ServiceCollection();
        services.AddTodoServices(true);
        var serviceProvider = services.BuildServiceProvider();

        _context = serviceProvider.GetRequiredService<TodoDbContext>();
        _service = serviceProvider.GetRequiredService<ITodoListService>();
    }

    [Fact]
    public async Task GetAllAsync_ReturnsEmptyList_WhenNoLists() {
        var result = await _service.GetAllAsync(TEST_USER_ID);
        Assert.Empty(result.Items);
    }

    [Fact]
    public async Task CreateAsync_AddsList() {
        var request = new CreateTodoListRequest("New List");
        var created = await _service.CreateAsync(request, TEST_USER_ID);

        Assert.NotEqual(0, created.Id);
        Assert.Equal("New List", created.Name);

        var inDb = await _context.TodoLists.FindAsync(created.Id);
        Assert.NotNull(inDb);
        Assert.Equal(TEST_USER_ID, inDb.UserId);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesExistingList() {
        var createRequest = new CreateTodoListRequest("Original");
        var list = await _service.CreateAsync(createRequest, TEST_USER_ID);

        var updateRequest = new UpdateTodoListRequest("Updated");
        var result = await _service.UpdateAsync(list.Id, updateRequest, TEST_USER_ID);

        Assert.NotNull(result);
        Assert.Equal("Updated", result.Name);
    }

    [Fact]
    public async Task DeleteAsync_RemovesList() {
        var createRequest = new CreateTodoListRequest("To Delete");
        var list = await _service.CreateAsync(createRequest, TEST_USER_ID);

        var result = await _service.DeleteAsync(list.Id, TEST_USER_ID);
        Assert.True(result);

        var inDb = await _context.TodoLists.FindAsync(list.Id);
        Assert.Null(inDb);
    }

    [Fact]
    public async Task ReorderAsync_UpdatesOrders() {
        var list1 = await _service.CreateAsync(new CreateTodoListRequest("List 1"), TEST_USER_ID);
        var list2 = await _service.CreateAsync(new CreateTodoListRequest("List 2"), TEST_USER_ID);

        await _service.ReorderAsync([list2.Id, list1.Id], TEST_USER_ID);

        var result = await _service.GetAllAsync(TEST_USER_ID);
        Assert.Equal(list2.Id, result.Items[0].Id);
        Assert.Equal(list1.Id, result.Items[1].Id);
    }
}
