namespace PasswordManager.Models.Static;

/**
 * This class holds static variables for use throughout API
 */
public static class ConfigCodes
{
    public static string JwtConfig = "api:jwt";
    public static string JwtKeyCode = "api:jwt:key";
    public static string JwtIssuer = "api:jwt:issuer";
    public static string JwtAudience = "api:jwt:audience";
    public static string JwtTfaKey = "api:jwt:tfakey";
}

public static class ClaimCodes
{
    public static string UserGuidClaim = "USERGUID";
    public static string IsFullyAuthed = "ISFULLYAUTHED";
}