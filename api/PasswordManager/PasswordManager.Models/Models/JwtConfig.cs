namespace PasswordManager.Models.Models;

/**
 * This class holds the data for the JSON Web Token used when handling sessions.
 */
public class JwtConfig
{
    public string issuer { get; set; }
    public string key { get; set; }
    public string audience { get; set; }
    public string tfakey { get; set; }

}