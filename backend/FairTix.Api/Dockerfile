# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["FairTix.Api.csproj", "."]
RUN dotnet restore "./FairTix.Api.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "FairTix.Api.csproj" -c Release -o /app/build
RUN dotnet publish "FairTix.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
EXPOSE 8081
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "FairTix.Api.dll"]
