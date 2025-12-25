using Microsoft.EntityFrameworkCore;

namespace Sam.CSharp.Ezra.Todo.Server.Services.Users;

public static class UserServiceCollectionExtensions {
    extension(IServiceCollection services) {
        public IServiceCollection AddUserServices(bool inMemory = false) {
            if (inMemory)
                services.AddDbContext<UserDbContext>(options =>
                    options.UseInMemoryDatabase(Guid.NewGuid().ToString()));
            else
                services.AddDbContext<UserDbContext>(options =>
                    options.UseSqlite("Data Source=user.db"));

            services.AddScoped<IUserService, UserService>();

            services.AddAuthorization();
            services.AddIdentityApiEndpoints<User>()
                .AddEntityFrameworkStores<UserDbContext>();

            return services;
        }
    }
}
