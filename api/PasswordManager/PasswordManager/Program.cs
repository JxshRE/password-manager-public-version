using System.Text;
using Asp.Versioning;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Net.Http.Headers;
using PasswordManager.Config;
using PasswordManager.Models.Models;
using PasswordManager.Repository;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

services.AddEndpointsApiExplorer();
services.AddSwaggerGen();

IConfiguration config = builder.Configuration;
// This gets the JWT config from appsettings.json
var jwtConfig = builder.Configuration.GetSection("api:jwt").Get<JwtConfig>();

// This is used to configure the authentication used within the API.
// It creates a default scheme for sessions as well as a separate scheme for two-factor authentication
// This is because 2FA happens before the session authentication and as such a separate Jwt bearer configuration is beneficial
services.AddAuthentication(o =>
    {
        o.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(x =>
    {
        x.TokenValidationParameters = new TokenValidationParameters()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtConfig.issuer,
            ValidAudience = jwtConfig.audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig.key))
        };
    }).AddJwtBearer("TfaScheme", x =>
    {
        x.TokenValidationParameters = new TokenValidationParameters()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtConfig.issuer,
            ValidAudience = jwtConfig.audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig.tfakey))
        };
    });

// This adds authorization to the API, it adds the default scheme and the two factor authentication scheme. 
services.AddAuthorization(o =>
{
    var def = new AuthorizationPolicyBuilder(
        JwtBearerDefaults.AuthenticationScheme,
        "TfaScheme");
    
    def = def.RequireAuthenticatedUser();
    
    o.DefaultPolicy = def.Build();

    var oTfaScheme = new AuthorizationPolicyBuilder("TfaScheme");
    o.AddPolicy("TfaScheme", oTfaScheme.RequireAuthenticatedUser().Build());
});




services.AddCors(options =>
{
    options.AddPolicy("EnableCORS", o =>
    {
        o.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

services.AddDbContext<PasswordManagerContext>(o =>
{
    o.UseLazyLoadingProxies();
    o.UseSqlServer("Server=localhost;Database=PasswordManager;Trusted_Connection=True;TrustServerCertificate=true");
});

services.ConfigureApplicationServices(config);
    
services.AddControllers();
services.AddApiVersioning(c =>
{
    c.DefaultApiVersion = new ApiVersion(1, 0);
    c.AssumeDefaultVersionWhenUnspecified = true;
});


// App configuration

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("EnableCORS");

app.UseAuthentication();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();