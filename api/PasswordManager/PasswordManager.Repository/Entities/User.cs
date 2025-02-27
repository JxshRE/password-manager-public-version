using System.ComponentModel.DataAnnotations;

namespace PasswordManager.Repository.Entities;

/**
 * The user DB entity.
 */
public class User
{
    [Key]
    public int Id { get; set; }
    public Guid UserGuid { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ModifiedAt { get; set; }
    public string? TwoStepKey { get; set; }
    
    public bool HasCompletedTwoStep { get; set; }
    
    public virtual IEnumerable<PasswordGroup> PasswordGroups { get; set; }

    public virtual IEnumerable<RefreshToken> RefreshTokens { get; set; }
}