using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Sam.CSharp.Ezra.Todo.Server.Services.Users;

public class UserDbContext(DbContextOptions<UserDbContext> options) : IdentityDbContext<User>(options) {
    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);

        builder.Entity<User>(entity => {
            entity.Property(u => u.Language)
                .HasConversion<string>();

            entity.Property(u => u.Theme)
                .HasConversion<string>();
        });
    }
}
