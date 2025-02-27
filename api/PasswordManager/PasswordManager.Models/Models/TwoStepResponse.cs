namespace PasswordManager.Models.Models;

/**
 * This class is used to hold data associated with the user's 2FA
 */
public class TwoStepResponse
{
    public string QrImgUrl { get; set; }
    public string ManualCode { get; set; }
}