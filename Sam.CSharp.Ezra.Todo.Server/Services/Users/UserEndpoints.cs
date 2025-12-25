using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Sam.CSharp.Ezra.Todo.Server.Services.Users;

public static class UserEndpoints {
    public static void MapUserEndpoints(this IEndpointRouteBuilder app) {
        var settings = app.MapGroup("/settings")
            .RequireAuthorization()
            .RequireRateLimiting("fixed");

        settings.MapGet("/", async Task<Ok<UpdateSettingsRequest>> (IUserService service, ClaimsPrincipal user) => {
            var language = await service.GetUserLanguageAsync(user);
            var theme = await service.GetUserThemeAsync(user);
            return TypedResults.Ok(new UpdateSettingsRequest(language, theme));
        });

        settings.MapPost("/",
            async Task<Results<NoContent, NotFound>> (UpdateSettingsRequest update, IUserService service,
                ClaimsPrincipal user) => {
                var success = await service.UpdateUserSettingsAsync(user, update.Language, update.Theme);
                return success ? TypedResults.NoContent() : TypedResults.NotFound();
            });
    }
}
