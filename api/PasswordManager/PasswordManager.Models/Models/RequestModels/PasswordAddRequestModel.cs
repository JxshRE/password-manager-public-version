namespace PasswordManager.Models.Models.RequestModels;

/**
 * This class is used to hold the form data when modifying and adding password entries.
 */
public class PasswordAddRequestModel
{
    public string Title { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public string? Notes { get; set; }
}