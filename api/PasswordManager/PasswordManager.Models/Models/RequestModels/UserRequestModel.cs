namespace PasswordManager.Models.Models.RequestModels;

/**
 * This class is used for holding the login and sign up form data being passed from client.
 */
public class UserRequestModel
{
    public string Username { get; set; }
    public string Password { get; set; }
}