using FluentValidation;
using Microsoft.AspNetCore.Http;
using Moq;
using Sam.CSharp.Ezra.Todo.Server.Core;

namespace Sam.CSharp.Ezra.Todo.Server.Tests;

public class ValidationFilterTests {
    [Fact]
    public async Task InvokeAsync_ReturnsValidationProblem_WhenValidationFails() {
        // Arrange
        var validator = new TestRequestValidator();
        var filter = new ValidationFilter<TestRequest>(validator);

        var request = new TestRequest { Name = "" }; // Fails validation
        var context = new Mock<EndpointFilterInvocationContext>();
        context.Setup(c => c.Arguments).Returns(new List<object?> { request });

        var result = await filter.InvokeAsync(context.Object, _ => ValueTask.FromResult<object?>(null));
        Assert.IsType<IContentTypeHttpResult>(result, false);
        Assert.Equal(400, (result as IStatusCodeHttpResult)?.StatusCode);
    }

    [Fact]
    public async Task InvokeAsync_CallsNext_WhenValidationSucceeds() {
        var validator = new TestRequestValidator();
        var filter = new ValidationFilter<TestRequest>(validator);

        var request = new TestRequest { Name = "Valid" };
        var context = new Mock<EndpointFilterInvocationContext>();
        context.Setup(c => c.Arguments).Returns(new List<object?> { request });

        var nextCalled = false;
        EndpointFilterDelegate next = _ => {
            nextCalled = true;
            return ValueTask.FromResult<object?>(null);
        };

        await filter.InvokeAsync(context.Object, next);
        Assert.True(nextCalled);
    }

    private class TestRequest {
        public string Name { get; init; } = string.Empty;
    }

    private class TestRequestValidator : AbstractValidator<TestRequest> {
        public TestRequestValidator() {
            RuleFor(x => x.Name).NotEmpty();
        }
    }
}
