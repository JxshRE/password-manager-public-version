using PasswordManager.Models.Models;
using PasswordManager.Repository.Entities;

namespace PasswordManager.Security.Interfaces;

public interface IPasswordServiceV1
{
    Task<List<Password>> GetPasswordsForUser(Guid userGuid);
    Task<PasswordModel> AddPasswordForUser(Guid userGuid, PasswordModel password);
    Task<PasswordModel?> UpdatePasswordForUser(Guid userGuid, PasswordModel model);
    Task<Password?> GetPasswordsForUserByGuid(Guid userGuid, Guid passwordGuid);
    Task<bool> DeletePassword(Guid userGuid, Guid passwordGuid);
    
}