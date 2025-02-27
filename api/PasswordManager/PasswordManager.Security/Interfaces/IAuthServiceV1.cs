using PasswordManager.Models.Models;

namespace PasswordManager.Security.Interfaces;

public interface IAuthServiceV1
{
    Task<Tokens?> AuthLoginUserAsync(string username, string password);

    Task<UserModel?> AuthCheckUserAsync(string username, string password);
    Task<Tokens?> AuthRegisterUserAsync(string username, string passwordHash);
    Task<UserModel?> GetUserByEmailAsync(string username);
    Task<Tokens> GetRefreshToken(Tokens oldTokens);
    Task<UserModel?> GetUserByGuidAsync(Guid userGuid);
    Task<Tokens?> VerifyTwoStepCode(Guid userGuid, string code);
    Task<TwoStepResponse> Setup2StepVerification(Guid userGuid);
    Task<bool> is2StepSetup(Guid userGuid);


}