using PasswordManager.Security.Interfaces;
using PasswordManager.Security.Services;

namespace PasswordManager.Config;

public static class ConfigureServices
{
    /**
     * This method is used to set up all the services using dependency injection
     * This allows for the services to be used throughout the API without the need to create a new instance of the class
     */
    public static IServiceCollection ConfigureApplicationServices(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddTransient<IAuthServiceV1, AuthServiceV1>();
        services.AddTransient<ISecurityServiceV1, SecurityServiceV1>();
        services.AddTransient<IPasswordServiceV1, PasswordServiceV1>();
        return services;
    }
}