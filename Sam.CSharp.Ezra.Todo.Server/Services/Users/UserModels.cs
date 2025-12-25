using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;

namespace Sam.CSharp.Ezra.Todo.Server.Services.Users;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Language {
    ENGLISH,
    SPANISH
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Theme {
    LIGHT,
    DARK
}

public class User : IdentityUser {
    public Language Language { get; set; } = Language.ENGLISH;
    public Theme Theme { get; set; } = Theme.LIGHT;
}
