using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

namespace Sam.CSharp.Ezra.Todo.Server.Services.Users;

public interface IUserService {
    Task<Language> GetUserLanguageAsync(ClaimsPrincipal user);
    Task<Theme> GetUserThemeAsync(ClaimsPrincipal user);
    Task<bool> UpdateUserSettingsAsync(ClaimsPrincipal user, Language? language, Theme? theme);
}

public class UserService(UserManager<User> userManager) : IUserService {
    public async Task<Language> GetUserLanguageAsync(ClaimsPrincipal user) {
        var appUser = await userManager.GetUserAsync(user);
        return appUser?.Language ?? Language.ENGLISH;
    }

    public async Task<Theme> GetUserThemeAsync(ClaimsPrincipal user) {
        var appUser = await userManager.GetUserAsync(user);
        return appUser?.Theme ?? Theme.LIGHT;
    }

    public async Task<bool> UpdateUserSettingsAsync(ClaimsPrincipal user, Language? language, Theme? theme) {
        var appUser = await userManager.GetUserAsync(user);
        if (appUser == null) return false;

        if (language.HasValue) appUser.Language = language.Value;
        if (theme.HasValue) appUser.Theme = theme.Value;

        var result = await userManager.UpdateAsync(appUser);
        return result.Succeeded;
    }
}
