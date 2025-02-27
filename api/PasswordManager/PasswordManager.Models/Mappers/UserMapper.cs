using PasswordManager.Models.Models;
using PasswordManager.Repository.Entities;

namespace PasswordManager.Models.Mappers;

public static class UserMapper
{
    /**
     * This method converts the user DB entity into a model class for passing data back to the client.
     */
    public static UserModel ToModel(this User user)
    {
        return new UserModel()
        {
            Username = user.Email,
            UserGuid = user.UserGuid,
            UserId = user.Id,
            TwoStepkey = user.TwoStepKey,
            hasTwoStep = user.HasCompletedTwoStep,
            RefreshTokens = user.RefreshTokens?.Select(x => new RefreshTokenInfo
            {
                RefreshToken = x.RefreshTokenValue,
                RefreshTokenExpiry = x.RefreshTokenExpiry,
                RefreshTokenGuid = x.RefreshTokenGuid
            }).ToList()
        };
    }
}