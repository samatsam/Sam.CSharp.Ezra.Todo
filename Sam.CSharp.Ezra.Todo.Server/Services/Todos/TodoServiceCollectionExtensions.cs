using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Sam.CSharp.Ezra.Todo.Server.Services.Todos;

public static class TodoServiceCollectionExtensions {
    extension(IServiceCollection services) {
        public IServiceCollection AddTodoServices(bool inMemory = false) {
            if (inMemory)
                services.AddDbContext<TodoDbContext>(options =>
                    options.UseInMemoryDatabase(Guid.NewGuid().ToString()));
            else
                services.AddDbContext<TodoDbContext>(options =>
                    options.UseSqlite("Data Source=todo.db"));

            services.AddScoped<ITodoService, TodoService>();
            services.AddScoped<ITodoListService, TodoListService>();

            services.AddValidatorsFromAssemblyContaining<CreateTodoRequestValidator>();

            return services;
        }
    }
}
