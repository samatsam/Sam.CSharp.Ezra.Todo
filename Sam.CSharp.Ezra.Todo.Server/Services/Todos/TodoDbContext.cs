using Microsoft.EntityFrameworkCore;
using Sam.CSharp.Ezra.Todo.Server.Models.Todos;

namespace Sam.CSharp.Ezra.Todo.Server.Services.Todos;

public class TodoDbContext(DbContextOptions<TodoDbContext> options) : DbContext(options) {
    public DbSet<TodoList> TodoLists { get; set; }
    public DbSet<TodoItem> Todos { get; set; }
}
