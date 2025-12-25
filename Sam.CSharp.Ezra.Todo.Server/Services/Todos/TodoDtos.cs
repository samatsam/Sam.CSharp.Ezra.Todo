using FluentValidation;

namespace Sam.CSharp.Ezra.Todo.Server.Services.Todos;

public record TodoDto(int Id, string Value, bool IsCompleted, int Order);

public record CreateTodoRequest(string Value, int ListId);

// TODO: We should look into supporting longer TODOs. I don't believe the UX renders our current lengths well.
public class CreateTodoRequestValidator : AbstractValidator<CreateTodoRequest> {
    public CreateTodoRequestValidator() {
        RuleFor(x => x.Value).NotEmpty().MaximumLength(2048);
        RuleFor(x => x.ListId).NotEmpty();
    }
}

public record UpdateTodoRequest(string Value, bool IsCompleted, int Order);

public class UpdateTodoRequestValidator : AbstractValidator<UpdateTodoRequest> {
    public UpdateTodoRequestValidator() {
        RuleFor(x => x.Value).NotEmpty().MaximumLength(2048);
        RuleFor(x => x.Order).GreaterThanOrEqualTo(0);
    }
}

public record TodoListDto(int Id, string Name, List<TodoDto> Todos);

public record CreateTodoListRequest(string Name);

public class CreateTodoListRequestValidator : AbstractValidator<CreateTodoListRequest> {
    public CreateTodoListRequestValidator() {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(256);
    }
}

public record UpdateTodoListRequest(string Name);

public class UpdateTodoListRequestValidator : AbstractValidator<UpdateTodoListRequest> {
    public UpdateTodoListRequestValidator() {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(256);
    }
}
