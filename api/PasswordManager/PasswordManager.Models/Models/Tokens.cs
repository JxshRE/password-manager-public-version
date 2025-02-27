namespace PasswordManager.Models.Models;

/**
 * This class is used to hold session and refresh token data for client.
 */
public class Tokens
{
    public string SessionToken { get; set; }
    public string RefreshToken { get; set; }
}