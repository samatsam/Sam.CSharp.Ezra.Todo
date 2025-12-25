using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Sam.CSharp.Ezra.Todo.Server.Core;

namespace Sam.CSharp.Ezra.Todo.Server.Services.Todos;

public static class TodoEndpoints {
    public static void MapTodoEndpoints(this IEndpointRouteBuilder app) {
        var todos = app.MapGroup("/todos").RequireAuthorization().RequireRateLimiting("fixed");

        todos.MapPost("/",
            async Task<Created<TodoDto>> (CreateTodoRequest request, ITodoService service,
                ClaimsPrincipal user) => {
                var created = await service.CreateAsync(request, user.GetUserId());
                return TypedResults.Created($"/todos/{created.Id}", created);
            }).AddEndpointFilter<ValidationFilter<CreateTodoRequest>>();

        todos.MapPost("/reorder",
            async (int listId, List<int> orderedIds, ITodoService service, ClaimsPrincipal user) => {
                await service.ReorderAsync(listId, orderedIds, user.GetUserId());
                return TypedResults.Ok();
            });

        todos.MapPut("/{id}",
            async Task<Results<Ok<TodoDto>, NotFound>> (int id, UpdateTodoRequest request, ITodoService service,
                ClaimsPrincipal user) => {
                var updated = await service.UpdateAsync(id, request, user.GetUserId());
                return updated is not null ? TypedResults.Ok(updated) : TypedResults.NotFound();
            }).AddEndpointFilter<ValidationFilter<UpdateTodoRequest>>();

        todos.MapDelete("/{id}",
            async Task<Results<NoContent, NotFound>> (int id, ITodoService service, ClaimsPrincipal user) => {
                var deleted = await service.DeleteAsync(id, user.GetUserId());
                return deleted ? TypedResults.NoContent() : TypedResults.NotFound();
            });

        var lists = app.MapGroup("/lists").RequireAuthorization().RequireRateLimiting("fixed");

        lists.MapGet("/",
            async Task<Ok<PagedResult<TodoListDto>>> (ITodoListService service, ClaimsPrincipal user, int page = 1,
                    int pageSize = 10) =>
                TypedResults.Ok(await service.GetAllAsync(user.GetUserId(), page, pageSize))
        );

        lists.MapPost("/",
            async Task<Created<TodoListDto>> (CreateTodoListRequest request, ITodoListService service,
                ClaimsPrincipal user) => {
                var created = await service.CreateAsync(request, user.GetUserId());
                return TypedResults.Created($"/lists/{created.Id}", created);
            }).AddEndpointFilter<ValidationFilter<CreateTodoListRequest>>();

        lists.MapPut("/{id}", async Task<Results<Ok<TodoListDto>, NotFound>> (int id, UpdateTodoListRequest request,
            ITodoListService service, ClaimsPrincipal user) => {
            var updated = await service.UpdateAsync(id, request, user.GetUserId());
            return updated is not null ? TypedResults.Ok(updated) : TypedResults.NotFound();
        }).AddEndpointFilter<ValidationFilter<UpdateTodoListRequest>>();

        lists.MapDelete("/{id}",
            async Task<Results<NoContent, NotFound>> (int id, ITodoListService service, ClaimsPrincipal user) => {
                var deleted = await service.DeleteAsync(id, user.GetUserId());
                return deleted ? TypedResults.NoContent() : TypedResults.NotFound();
            });

        lists.MapPost("/reorder", async (List<int> orderedIds, ITodoListService service, ClaimsPrincipal user) => {
            await service.ReorderAsync(orderedIds, user.GetUserId());
            return TypedResults.NoContent();
        });
    }
}
