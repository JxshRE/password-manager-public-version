using System.Text;
using PasswordManager.Models.Models;
using PasswordManager.Repository.Entities;

namespace PasswordManager.Models.Mappers;

public static class PasswordMapper
{
    /*
     * Calling this method will convert the entity class into a model class for use when returning data
     */
    public static PasswordModel ToModel(this Password entity)
    {
        return new PasswordModel()
        {
            Title = Encoding.UTF8.GetString(Convert.FromBase64String(entity.PasswordName)),
            Password = Encoding.UTF8.GetString(Convert.FromBase64String(entity.EncryptedPassword)),
            Username = Encoding.UTF8.GetString(Convert.FromBase64String(entity.Username)),
            PasswordGuid = entity.PasswordGuid,
            PasswordId = entity.PasswordId,
            Notes = entity.Notes != null ? Encoding.UTF8.GetString(Convert.FromBase64String(entity.Notes)) : null
        };
    }
}