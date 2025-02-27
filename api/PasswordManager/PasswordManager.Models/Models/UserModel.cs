using PasswordManager.Repository.Entities;

namespace PasswordManager.Models.Models;

/**
 * This class is used when passing user data back to the client.
 */
public class UserModel
{
    public string Username { get; set; }
    public Guid UserGuid { get; set; }
    public int UserId { get; set; }
    public string? TwoStepkey { get; set; }
    public bool hasTwoStep { get; set; }
    
    public List<RefreshTokenInfo> RefreshTokens { get; set; }
}