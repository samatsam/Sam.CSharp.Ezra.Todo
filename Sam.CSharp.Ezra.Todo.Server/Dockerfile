# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore
COPY ["Sam.CSharp.Ezra.Todo.Server.csproj", "./"]
RUN dotnet restore "Sam.CSharp.Ezra.Todo.Server.csproj"

# Build
COPY . .
RUN dotnet publish "Sam.CSharp.Ezra.Todo.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Sam.CSharp.Ezra.Todo.Server.dll"]
