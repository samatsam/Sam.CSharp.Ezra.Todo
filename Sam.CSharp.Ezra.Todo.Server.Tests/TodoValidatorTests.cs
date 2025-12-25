using FluentValidation.TestHelper;
using Sam.CSharp.Ezra.Todo.Server.Services.Todos;

namespace Sam.CSharp.Ezra.Todo.Server.Tests;

public class TodoValidatorTests {
    private readonly CreateTodoListRequestValidator _createTodoListValidator = new();
    private readonly CreateTodoRequestValidator _createTodoValidator = new();
    private readonly UpdateTodoListRequestValidator _updateTodoListValidator = new();
    private readonly UpdateTodoRequestValidator _updateTodoValidator = new();

    [Fact]
    public void CreateTodoRequest_ShouldHaveError_WhenValueIsEmpty() {
        var request = new CreateTodoRequest("", 1);
        var result = _createTodoValidator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Value);
    }

    [Fact]
    public void CreateTodoRequest_ShouldHaveError_WhenValueIsTooLong() {
        var request = new CreateTodoRequest(new string('a', 2049), 1);
        var result = _createTodoValidator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Value);
    }

    [Fact]
    public void CreateTodoRequest_ShouldHaveError_WhenListIdIsEmpty() {
        var request = new CreateTodoRequest("Valid", 0);
        var result = _createTodoValidator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.ListId);
    }

    [Fact]
    public void CreateTodoRequest_ShouldNotHaveError_WhenValid() {
        var request = new CreateTodoRequest("Valid", 1);
        var result = _createTodoValidator.TestValidate(request);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void UpdateTodoRequest_ShouldHaveError_WhenValueIsEmpty() {
        var request = new UpdateTodoRequest("", false, 0);
        var result = _updateTodoValidator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Value);
    }

    [Fact]
    public void UpdateTodoRequest_ShouldHaveError_WhenOrderIsNegative() {
        var request = new UpdateTodoRequest("Valid", false, -1);
        var result = _updateTodoValidator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Order);
    }

    [Fact]
    public void CreateTodoListRequest_ShouldHaveError_WhenNameIsEmpty() {
        var request = new CreateTodoListRequest("");
        var result = _createTodoListValidator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void CreateTodoListRequest_ShouldHaveError_WhenNameIsTooLong() {
        var request = new CreateTodoListRequest(new string('a', 257));
        var result = _createTodoListValidator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void UpdateTodoListRequest_ShouldHaveError_WhenNameIsEmpty() {
        var request = new UpdateTodoListRequest("");
        var result = _updateTodoListValidator.TestValidate(request);
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }
}
