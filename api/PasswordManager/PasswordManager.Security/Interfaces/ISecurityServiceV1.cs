namespace PasswordManager.Security.Interfaces;

public interface ISecurityServiceV1
{
    string Sha256HashString(string toHash);
}