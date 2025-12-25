using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Sam.CSharp.Ezra.Todo.Server.Services.Todos;
using Sam.CSharp.Ezra.Todo.Server.Services.Users;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// External services
builder.Services.AddOpenApi();
builder.Services.ConfigureHttpJsonOptions(options => {
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Rate Limiting
builder.Services.AddRateLimiter(options => {
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // TODO: Consult with product on expected load
    options.AddFixedWindowLimiter("fixed", opt => {
        opt.PermitLimit = 600;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 2;
    });

    // TODO: Consult with security on safe limits for our usecase
    options.AddFixedWindowLimiter("auth", opt => {
        opt.PermitLimit = 60;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });
});

// CORS
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options => {
    options.AddPolicy("AllowClient",
        policy => policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

// Internal services
builder.Services
    .AddTodoServices()
    .AddUserServices();

// Add FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<CreateTodoRequestValidator>();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseExceptionHandler(exceptionHandlerApp => {
    exceptionHandlerApp.Run(async context => {
        var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
        var exception = exceptionHandlerPathFeature?.Error;

        var problemDetails = new ProblemDetails {
            Status = StatusCodes.Status500InternalServerError,
            Title = "An error occurred while processing your request.",
            Detail = exception?.Message
        };

        if (exception is UnauthorizedAccessException) {
            problemDetails.Status = StatusCodes.Status403Forbidden;
            problemDetails.Title = "Forbidden";
        } else if (exception is KeyNotFoundException) {
            problemDetails.Status = StatusCodes.Status404NotFound;
            problemDetails.Title = "Not Found";
        }

        context.Response.StatusCode = problemDetails.Status.Value;
        await context.Response.WriteAsJsonAsync(problemDetails);
    });
});

if (app.Environment.IsDevelopment()) {
    app.MapOpenApi();
    app.MapScalarApiReference();
} else {
    app.UseHttpsRedirection();
}

app.UseCors("AllowClient");
app.UseRateLimiter();
app.UseAuthorization();

// Database Initialization
using (var scope = app.Services.CreateScope()) {
    var userDb = scope.ServiceProvider.GetRequiredService<UserDbContext>();
    var todoDb = scope.ServiceProvider.GetRequiredService<TodoDbContext>();

    userDb.Database.EnsureCreated();
    todoDb.Database.EnsureCreated();
}

// API Endpoints
// TODO: Move these into domain-specific extension methods for max cohesion
app.MapIdentityApi<User>().RequireRateLimiting("auth");
app.MapUserEndpoints();
app.MapTodoEndpoints();

app.Run();
