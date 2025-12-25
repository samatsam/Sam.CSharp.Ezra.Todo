using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Sam.CSharp.Ezra.Todo.Server.Tests;

public class RateLimitingTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>> {
    [Fact]
    public async Task AuthEndpoints_ShouldHaveRateLimiting() {
        var client = factory.CreateClient();

        // The "auth" policy has a limit of 60 requests per minute
        var loginData = new { email = "test@example.com", password = "Password123!" };
        var json = JsonSerializer.Serialize(loginData);

        for (var i = 0; i < 65; i++) {
            var response = await client.PostAsync("/login", new StringContent(json, Encoding.UTF8, "application/json"));

            if (i >= 60) {
                Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
            } else {
                Assert.NotEqual(HttpStatusCode.TooManyRequests, response.StatusCode);
                Assert.NotEqual(HttpStatusCode.InternalServerError, response.StatusCode);
            }
        }
    }
}
