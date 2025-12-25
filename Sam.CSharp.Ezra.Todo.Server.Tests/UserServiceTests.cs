using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Sam.CSharp.Ezra.Todo.Server.Services.Users;

namespace Sam.CSharp.Ezra.Todo.Server.Tests;

public class UserServiceTests {
    private readonly IUserService _service;
    private readonly UserManager<User> _userManager;

    public UserServiceTests() {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddUserServices(true);
        var serviceProvider = services.BuildServiceProvider();

        _service = serviceProvider.GetRequiredService<IUserService>();
        _userManager = serviceProvider.GetRequiredService<UserManager<User>>();
    }

    [Fact]
    public async Task GetUserLanguageAsync_ReturnsLanguage_WhenUserExists() {
        var user = new User
            { UserName = "test@example.com", Email = "test@example.com", Language = Language.SPANISH };
        await _userManager.CreateAsync(user);

        var principal = await CreatePrincipal(user);

        var result = await _service.GetUserLanguageAsync(principal);
        Assert.Equal(Language.SPANISH, result);
    }

    [Fact]
    public async Task UpdateUserSettingsAsync_ReturnsTrue_WhenUpdateSucceeds() {
        var user = new User
            { UserName = "test2@example.com", Email = "test2@example.com", Language = Language.ENGLISH };
        await _userManager.CreateAsync(user);

        var principal = await CreatePrincipal(user);

        var result = await _service.UpdateUserSettingsAsync(principal, Language.SPANISH, null);
        Assert.True(result);

        var updatedUser = await _userManager.FindByIdAsync(user.Id);
        Assert.NotNull(updatedUser);
        Assert.Equal(Language.SPANISH, updatedUser.Language);
    }

    private async Task<ClaimsPrincipal> CreatePrincipal(User user) {
        var claims = await _userManager.GetClaimsAsync(user);
        var identity = new ClaimsIdentity(claims, "TestAuthType");
        identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.Id));
        identity.AddClaim(new Claim(ClaimTypes.Name, user.UserName!));
        return new ClaimsPrincipal(identity);
    }
}
