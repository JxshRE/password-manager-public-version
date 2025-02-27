using System.ComponentModel.DataAnnotations;

namespace PasswordManager.Repository.Entities;

/**
 * The refresh token DB entity.
 */
public class RefreshToken
{
    [Key]
    public int RefreshTokenId { get; set; } 
    
    public Guid RefreshTokenGuid { get; set; }
    
    public int UserId { get; set; }
    
    public string RefreshTokenValue { get; set; }

    public DateTime RefreshTokenExpiry { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime ModifiedAt { get; set; }
    
    public virtual User User { get; set; }
}