using System.Security.Claims;
using Sam.CSharp.Ezra.Todo.Server.Core;

namespace Sam.CSharp.Ezra.Todo.Server.Tests;

public class ClaimsPrincipalExtensionsTests {
    [Fact]
    public void GetUserId_ReturnsNameIdentifier_WhenPresent() {
        var userId = "user-123";
        var claims = new List<Claim> {
            new(ClaimTypes.NameIdentifier, userId)
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        var result = principal.GetUserId();
        Assert.Equal(userId, result);
    }

    [Fact]
    public void GetUserId_ThrowsUnauthorizedAccessException_WhenNotPresent() {
        var principal = new ClaimsPrincipal(new ClaimsIdentity());
        Assert.Throws<UnauthorizedAccessException>(() => principal.GetUserId());
    }
}
