using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PasswordManager.Repository.Entities;

/**
 * The password group DB entity
 */
public class PasswordGroup
{
    [Key]
    public int Id { get; set; }
    
    public Guid InstanceGuid { get; set; }
    
    public string Name { get; set; }
    
    public int Owner { get; set; }
    
    public Guid OwnerGuid { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime ModifiedAt { get; set; }
    
    public virtual User OwnerUser { get; set; }
    public virtual IEnumerable<Password> Passwords { get; set; }
}