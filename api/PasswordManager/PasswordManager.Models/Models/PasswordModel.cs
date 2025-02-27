namespace PasswordManager.Models.Models;

/**
 * This class is used to hold data for password entries being passed back to the client
 */
public class PasswordModel
{
    public string Title { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public Guid PasswordGuid { get; set; }
    public int PasswordId { get; set; }
    public string? Notes { get; set; }
}