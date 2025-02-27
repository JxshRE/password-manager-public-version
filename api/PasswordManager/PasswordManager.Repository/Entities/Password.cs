namespace PasswordManager.Repository.Entities;

/**
 * The password DB entity
 */
public class Password
{
    public int PasswordId { get; set; }
    public int PasswordGroupId { get; set; }
    public Guid PasswordGuid { get; set; }
    public string PasswordName { get; set; }
    public string EncryptedPassword { get; set; }
    public string Username { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ModifiedAt { get; set; }
    public string? Notes { get; set; }
    
    public virtual PasswordGroup PasswordGroup { get; set; }
}