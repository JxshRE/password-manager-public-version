namespace PasswordManager.Models.Models;

/**
 * This class is used for holding the refresh token data to be sent to client.
 */
public class RefreshTokenInfo
{
    public string RefreshToken { get; set; }
    public Guid RefreshTokenGuid { get; set; }
    public DateTime RefreshTokenExpiry { get; set; }
}