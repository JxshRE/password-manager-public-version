using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Identity.Client;
using PasswordManager.Models.Mappers;
using PasswordManager.Models.Models;
using PasswordManager.Repository;
using PasswordManager.Repository.Entities;
using PasswordManager.Security.Interfaces;

namespace PasswordManager.Security.Services;

public class PasswordServiceV1 : IPasswordServiceV1
{
    private readonly IConfiguration _configuration;
    private readonly PasswordManagerContext _dbContext;
    private readonly IAuthServiceV1 _authService;
    
    public PasswordServiceV1(PasswordManagerContext context, IConfiguration config, IAuthServiceV1 authService)
    {
        _dbContext = context;
        _configuration = config;
        _authService = authService;
    }

    /**
     * This method is used to get the users default password group
     */
    private async Task<PasswordGroup?> GetDefaultPasswordGroupAsync(Guid userGuid)
    {
        var pGroup = await _dbContext.PasswordGroup.FirstOrDefaultAsync(x => x.OwnerGuid == userGuid);
        return pGroup;
    }

    /**
     * This method is used to add a password group to the DB for the user
     */
    private async Task<PasswordGroup> AddPasswordGroupAsync(UserModel user)
    {
        var toAdd = new PasswordGroup()
        {
            OwnerGuid = user.UserGuid,
            Name = user.Username,
            Owner = user.UserId,
            CreatedAt = DateTime.Now,
            ModifiedAt = DateTime.Now,
            InstanceGuid = Guid.NewGuid()
        };

        var added = (await _dbContext.PasswordGroup.AddAsync(toAdd));
        await _dbContext.SaveChangesAsync();
        return toAdd;
    }
    
    /**
     * This method is used to get the users password entries
     */
    public async Task<List<Password>> GetPasswordsForUser(Guid userGuid)
    {
        var user = await _authService.GetUserByGuidAsync(userGuid);
        if (user == null)
            return new List<Password>();

        var passwordGroup = await GetDefaultPasswordGroupAsync(userGuid);
        if (passwordGroup == null)
            return new List<Password>();

        var passwords = passwordGroup.Passwords.ToList();
        return passwords;
    }
    
    /**
     * This method is used to get the password entry from the user based on the GUID passed.
     * This is used to get single password entries.
     */
    public async Task<Password?> GetPasswordsForUserByGuid(Guid userGuid, Guid passwordGuid)
    {
        var user = await _authService.GetUserByGuidAsync(userGuid);
        if (user == null)
            return new Password();

        var passwordGroup = await GetDefaultPasswordGroupAsync(userGuid);
        if (passwordGroup == null)
            return new Password();

        var password = passwordGroup.Passwords.ToList().FirstOrDefault(x => x.PasswordGuid == passwordGuid);
        return password;
    }

    /**
     * This method is used to delete a password entry from the db for the user
     * Usually these methods would activate a deleted flag but due to the sensitive nature of the data
     * This method removes the entry completely from the database.
     * There is confirmation before this request is made on the client so they don't accidentally delete their passwords.
     */
    public async Task<bool> DeletePassword(Guid userGuid, Guid passwordGuid)
    {
        var curPasswords = await GetPasswordsForUser(userGuid);
        var curPassword = curPasswords.FirstOrDefault(x => x.PasswordGuid == passwordGuid);

        if (curPassword == null)
            return false;

        _dbContext.Password.Remove(curPassword);

        await _dbContext.SaveChangesAsync();
        return true;
    }
    
    /**
     * This method is used to update the password entry for the user based on the data passed to the method
     */
    public async Task<PasswordModel?> UpdatePasswordForUser(Guid userGuid, PasswordModel model)
    {
        var curPasswords = await GetPasswordsForUser(userGuid);
        var curPassword = curPasswords.FirstOrDefault(x => x.PasswordGuid == model.PasswordGuid);

        if (curPassword == null)
            return null;
        
        curPassword.EncryptedPassword = Convert.ToBase64String(Encoding.UTF8.GetBytes(model.Password));
        curPassword.Username = Convert.ToBase64String(Encoding.UTF8.GetBytes(model.Username));
        curPassword.PasswordName = Convert.ToBase64String(Encoding.UTF8.GetBytes(model.Title));
        curPassword.Notes = model.Notes != null ? Convert.ToBase64String(Encoding.UTF8.GetBytes(model.Notes)) : null;
        _dbContext.Password.Update(curPassword);
        await _dbContext.SaveChangesAsync();

        return curPassword.ToModel();
    }
    
    /**
     * This method is used to add a password entry for the user into the DB
     */
    public async Task<PasswordModel> AddPasswordForUser(Guid userGuid, PasswordModel password)
    {
        var user = await _authService.GetUserByGuidAsync(userGuid);
        if (user == null)
            return new PasswordModel();
        
        var passwordGroup = await GetDefaultPasswordGroupAsync(userGuid);
        if (passwordGroup == null)
            passwordGroup = await AddPasswordGroupAsync(user);

        var toAdd = new Password()
        {
            Username = Convert.ToBase64String(Encoding.UTF8.GetBytes(password.Username)),
            PasswordGroupId = passwordGroup.Id,
            PasswordName = Convert.ToBase64String(Encoding.UTF8.GetBytes(password.Title)),
            EncryptedPassword = Convert.ToBase64String(Encoding.UTF8.GetBytes(password.Password)),
            CreatedAt = DateTime.Now,
            ModifiedAt = DateTime.Now,
            Notes = password.Notes != null ? Convert.ToBase64String(Encoding.UTF8.GetBytes(password.Notes)) : null,
            PasswordGuid = Guid.NewGuid()
        };
        await _dbContext.Password.AddAsync(toAdd);
        await _dbContext.SaveChangesAsync();
        return toAdd.ToModel();
    }
}