using System.Security.Cryptography;
using System.Text;
using PasswordManager.Security.Interfaces;

namespace PasswordManager.Security.Services;

public class SecurityServiceV1 : ISecurityServiceV1
{
    /**
     * This method is used to hash a string using SHA256 hashing.
     * This is used when logging in a user or registering a user to rehash the password from the client to which it is then stored/checked
     */
    public string Sha256HashString(string toHash)
    {
        using (var sha = SHA256.Create())
        {
            var bytes = Encoding.UTF8.GetBytes(toHash);
            var hash = sha.ComputeHash(bytes);

            return System.Convert.ToBase64String(hash);
        }
    }
}