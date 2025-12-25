using FluentValidation;

namespace Sam.CSharp.Ezra.Todo.Server.Core;

// Validates request arguments of type T using the provided FluentValidation validator.
public class ValidationFilter<T>(IValidator<T> validator) : IEndpointFilter {
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next) {
        foreach (var arg in context.Arguments.OfType<T>()) {
            var validationResult = await validator.ValidateAsync(arg);
            if (!validationResult.IsValid)
                return Results.ValidationProblem(validationResult.ToDictionary());
        }

        return await next(context);
    }
}
