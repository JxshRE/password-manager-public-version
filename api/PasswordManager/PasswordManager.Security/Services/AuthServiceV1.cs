using System.IdentityModel.Tokens.Jwt;
using System.Reflection.Metadata;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PasswordManager.Models.Mappers;
using PasswordManager.Models.Models;
using PasswordManager.Models.Models.RequestModels;
using PasswordManager.Models.Static;
using PasswordManager.Repository;
using PasswordManager.Repository.Entities;
using PasswordManager.Security.Interfaces;
using Google.Authenticator;

namespace PasswordManager.Security.Services;

public class AuthServiceV1 : IAuthServiceV1
{
    private readonly IConfiguration _configuration;
    private readonly PasswordManagerContext _dbContext;
    private readonly ISecurityServiceV1 _securityService;
    public AuthServiceV1(PasswordManagerContext context, IConfiguration config, ISecurityServiceV1 securityService)
    {
        _dbContext = context;
        _configuration = config;
        _securityService = securityService;
    }

    /**
     * This method gets the user db entity by their GUID
     */
    private async Task<User?> GetUserEntityByGuidAsync(Guid userGuid)
    {
        var user = await _dbContext.User.FirstOrDefaultAsync(x => x.UserGuid == userGuid);
        return user;
    }
    
    /**
     * This method gets the user data as the model class by their GUID
     */
    public async Task<UserModel?> GetUserByGuidAsync(Guid userGuid)
    {
        var user = await _dbContext.User.FirstOrDefaultAsync(x => x.UserGuid == userGuid);
        return user?.ToModel();
    }

    /**
     * This method is used to handle the refresh token logic.
     * It generates a refresh token based on the previous tokens the user was assigned.
     * It does some validation to make sure the user exists and that their old token matches what was in the DB
     * It re-adds the claims associated with the refresh token, generates it and then returns it.
     */
    public async Task<Tokens> GetRefreshToken(Tokens oldTokens)
    {
        var session = oldTokens.SessionToken;
        var refresh = oldTokens.RefreshToken;

        var tokenValidation = await GetOldTokenValidation(session);
        if (tokenValidation == null)
            return null;

        var email = tokenValidation.ClaimsIdentity.Name;
        if (email == null)
            return null;

        var user = await GetUserByEmailAsync(email);
        if (user == null)
            return null;
        
        var tokenFound = user.RefreshTokens.Find(x => x.RefreshToken == refresh);
        if ( tokenFound == null || tokenFound.RefreshToken != refresh || tokenFound.RefreshTokenExpiry <= DateTime.UtcNow)
            return null;
        
        var sToken = tokenValidation.SecurityToken;
        if (sToken is not JwtSecurityToken)
            return null;

        var claims = tokenValidation.Claims.Select(x => new Claim(x.Key, x.Value.ToString())).ToList();
        if (claims == null || !claims.Any())
            return null;

        var tokenStr = await CreateTokenFromClaims(claims) ?? null;
        var refreshToken = await CreateRefreshToken(user.Username);

        if (string.IsNullOrEmpty(tokenStr))
            return null;

        var tokenGuid = tokenFound.RefreshTokenGuid;
        await UpdateRefreshTokenForUser(user.Username, tokenGuid, refreshToken, DateTime.UtcNow.AddDays(1));

        return new Tokens()
        {
            RefreshToken = refreshToken,
            SessionToken = tokenStr
        };
    }

    /**
     * This method handles authentication for logging in user, it checks the user password matches
     * It then generates the temporary 2fa tokens and returns them to the client to proceed with 2FA
     */
    public async Task<Tokens?> AuthLoginUserAsync(string username, string passwordHash)
    {
        var serverHash = _securityService.Sha256HashString(passwordHash); // hash again for extra security

        var user = await AuthCheckUserAsync(username, serverHash);
        if (user == null)
            return null;

        var tempToken = await Generate2StepSession(user);

        var tokens = new Tokens()
        {
            RefreshToken = null,
            SessionToken = tempToken
        };
        
        return tokens;
    }
    
    /**
     * This method handles the registration of new users
     * It checks a user with the specified email does not already exist
     * It will then create the user using the data it has been passed
     * It will generate the 2FA tokens for the user to set up their 2FA 
     */
    public async Task<Tokens?> AuthRegisterUserAsync(string username, string passwordHash)
    {
        var serverHash = _securityService.Sha256HashString(passwordHash); // hash again for extra security
         
        var user = await GetUserByEmailAsync(username);
        
        if (user != null) // user exists already
            return null;

        var userAdded = await CreateUser(username, serverHash);
        if (userAdded == null)
            return null;

        var token = await Generate2StepSession(userAdded.ToModel());
        return new Tokens(){RefreshToken = null, SessionToken = token};
    }

    /**
     * This method gets user by their email
     */
    public async Task<UserModel?> GetUserByEmailAsync(string username)
    {
        var user = await _dbContext.User.FirstOrDefaultAsync(x => x.Email == username);
        return user?.ToModel();
    }

    /**
     * This method updates the refresh token for the user
     * It gets called to update the old refresh token values with the new refresh token values so that the db is up to date
     */
    private async Task UpdateRefreshTokenForUser(string email, Guid refreshTokenGuid, string newRefreshToken, DateTime expiration)
    {
        var user = await GetUserByEmailAsync(email);
        var userToken =
            _dbContext.RefreshToken.FirstOrDefault(x =>
                x.UserId == user.UserId && x.RefreshTokenGuid == refreshTokenGuid);
        if (user == null)
            return;
        try
        {
            userToken.RefreshTokenValue = newRefreshToken;
            userToken.RefreshTokenExpiry = expiration;
            _dbContext.RefreshToken.Update(userToken);
        }
        catch (Exception e)
        {
            return;
        }

        await _dbContext.SaveChangesAsync();
    }
    
    /**
     * This method creates a refresh token for the user within the DB
     * so that the API can check the old refresh token against the one stored in the db for user security.
     */
    private async Task CreateRefreshTokenForUser(string email, string newRefreshToken, DateTime expiration)
    {
        var user = await GetUserByEmailAsync(email);
        if (user == null)
            return;

        var newToken = new RefreshToken()
        {
            UserId = user.UserId,
            RefreshTokenGuid = Guid.NewGuid(),
            RefreshTokenValue = newRefreshToken,
            RefreshTokenExpiry = expiration,
            CreatedAt = DateTime.UtcNow,
            ModifiedAt = DateTime.UtcNow
        };

        try
        {
            await _dbContext.RefreshToken.AddAsync(newToken);
        }
        catch (Exception e)
        {
            return;
        }

        await _dbContext.SaveChangesAsync();
    }

    /**
     * This method gets the refresh token GUID/identifier for the refresh token actively associated with the specified user
     */
    private async Task<Guid?> GetRefTokenGuidForUser(string email)
    {
        var user = await GetUserByEmailAsync(email);
        if (user == null)
            return null;
        
        var userToken = _dbContext.RefreshToken.FirstOrDefault(x =>
                x.UserId == user.UserId);

        if (userToken == null)
            return null;
        
        return userToken?.RefreshTokenGuid ?? null;
    }
    
    /**
     * This method is used to check the password against the username/email provided to make sure that the password is associated with that user
     * It will return a valid user model if the username/email and the password hash matched what is stored in the db
     * Otherwise it will just return a null instance of the class
     */
    public async Task<UserModel?> AuthCheckUserAsync(string username, string password)
    {
        var user = await _dbContext.User.FirstOrDefaultAsync(x => x.Email == username && x.PasswordHash == password);

        return user?.ToModel();
    }

    /**
     * This method creates the user within the database
     * It is used during the registration of a new user and assigns the email/username and the password hash to the user
     * as well as generating a unique GUID for them.
     */
    private async Task<User?> CreateUser(string username, string passwordHash)
    {
        var userEntity = new User()
        {
            Email = username,
            PasswordHash = passwordHash,
            UserGuid = Guid.NewGuid(),
            CreatedAt = DateTime.Now,
            ModifiedAt = DateTime.Now
        };
        
        try
        {
            await _dbContext.User.AddAsync(userEntity);
            await _dbContext.SaveChangesAsync();
        }
        catch (Exception e)
        {
            return null;
        }

        return userEntity;
    }

    /**
     * This method gets the old token validation result based on the token provided
     * This is used to validate that the token provided is a valid token.
     */
    private async Task<TokenValidationResult> GetOldTokenValidation(string? token)
    {
        if (string.IsNullOrEmpty(token))
            return null;
        
        var jwtKey = _configuration[ConfigCodes.JwtKeyCode];
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

        var validation = new TokenValidationParameters()
        {
            ValidateIssuerSigningKey = false,
            IssuerSigningKey = key,
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateLifetime = false
        };

        var th = new JwtSecurityTokenHandler();
        var p = await th.ValidateTokenAsync(token, validation);
        if (p == null | p.Exception != null)
            return null;

        return p;
    }

    /**
     * This method creates a token with the specified claims
     * This is used when generating a token for the user when they successfully authenticate
     */
    private async Task<string?> CreateTokenFromClaims(List<Claim> claims)
    {
        var jwtKey = _configuration[ConfigCodes.JwtKeyCode];
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var token = new JwtSecurityToken(
            _configuration[ConfigCodes.JwtIssuer],
            _configuration[ConfigCodes.JwtAudience],
            claims,
            expires: DateTime.Now.AddMinutes(15),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /**
     * This method generates the 2FA tokens which are passed to the front end.
     * These tokens are temporary and have a 15 minute expiry time
     * They are given before the session token is returned to the client as this token
     * allows for the user to call the 2FA endpoint with their correct one time code
     */
    private async Task<string> Generate2StepSession(UserModel user)
    {
        var jwtKey = _configuration[ConfigCodes.JwtTfaKey];
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>()
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.NameIdentifier, user.UserGuid.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimCodes.UserGuidClaim, user.UserGuid.ToString()),
        };
        
        var token = new JwtSecurityToken(
            _configuration[ConfigCodes.JwtIssuer],
            _configuration[ConfigCodes.JwtAudience],
            claims,
            expires: DateTime.Now.AddMinutes(15),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    
    /**
     * This method generates the session token which is returned to the user once they pass authentication
     */
    private async Task<string?> GenerateSessionToken(UserModel user)
    {
        var jwtKey = _configuration[ConfigCodes.JwtKeyCode];
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>()
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.NameIdentifier, user.UserGuid.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimCodes.UserGuidClaim, user.UserGuid.ToString()),
        };
        
        var token = new JwtSecurityToken(
            _configuration[ConfigCodes.JwtIssuer],
            _configuration[ConfigCodes.JwtAudience],
            claims,
            expires: DateTime.Now.AddMinutes(15),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /**
     * This method creates a refresh token string for the user which includes a random guid with their username/email appended to it
     */
    private async Task<string> CreateRefreshToken(string username)
    {
        var rndGuid = Guid.NewGuid();
        var token = $"{rndGuid}{username}";
        
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(token));
    }

    /**
     * This method generates the 2FA key which is used when setting up 2FA for the user
     */
    private async Task<string> Generate2StepKey(User user)
    {
        var key = Convert.ToBase64String(Encoding.UTF8.GetBytes(Guid.NewGuid().ToString()));
        
        return key;
    }

    /**
     * This method sets up 2FA for the user when they have not yet set it up.
     * To handle the google authentication side it uses the TwoFactorAuthentication class
     * from the GoogleAuthenticator Nuget package: https://www.nuget.org/packages/GoogleAuthenticator
     * This method simply gets the QR code and the manual entry key assigned to the 2FA as well generating a unique 2FA key for the user
     * This unique 2FA key is assigned to user in the database to handle the authentication when they login
     */
    public async Task<TwoStepResponse> Setup2StepVerification(Guid userGuid)
    {
        var user = await GetUserEntityByGuidAsync(userGuid);
        if (user == null)
            return new TwoStepResponse();

        if (user.HasCompletedTwoStep)
            return new TwoStepResponse();

        var key = user.TwoStepKey ?? await Generate2StepKey(user);

        var tfa = new TwoFactorAuthenticator();
        var setup = tfa.GenerateSetupCode("Individual Project Password Manager", user.Email, key, false, 3);

        var qrImgUrl = setup.QrCodeSetupImageUrl;
        var manualCode = setup.ManualEntryKey;

        user.TwoStepKey = key;
        _dbContext.User.Update(user);
        await _dbContext.SaveChangesAsync();

        return new TwoStepResponse() { QrImgUrl = qrImgUrl, ManualCode = manualCode };


    }

    /**
     * This method is used to check if the user has completed the 2FA setup.
     */
    public async Task<bool> is2StepSetup(Guid userGuid)
    {
        var user = await GetUserEntityByGuidAsync(userGuid);
        if (user == null || !user.HasCompletedTwoStep)
            return false;

        return true;
    }

    /**
     * This method is used to verify a 2FA code which uses the TwoFactorAuthenticator class from the GoogleAuthenticator nuget package
     * This method uses that class to validate the code the user entered against what their valid code is
     * If the code is correct it returns the session token and refresh token back to the client so they can access their passwords.
     */
    public async Task<Tokens?> VerifyTwoStepCode(Guid userGuid, string code)
    {
        var user = await GetUserEntityByGuidAsync(userGuid);
        if (user == null )
            return null;

        if (string.IsNullOrEmpty(user.TwoStepKey))
            return null;

        var key = user.TwoStepKey!;

        var tfa = new TwoFactorAuthenticator();
        var isVerified = tfa.ValidateTwoFactorPIN(key, code);

        if (!isVerified)
            return null;

        user.HasCompletedTwoStep = true;
        _dbContext.User.Update(user);
        await _dbContext.SaveChangesAsync();

        var uModel = user.ToModel();
        var token = await GenerateSessionToken(uModel);
        var refToken = await CreateRefreshToken(uModel.Username);
        var refTokenGuid = await GetRefTokenGuidForUser(uModel.Username);

        if (refTokenGuid == null)
        {
            await CreateRefreshTokenForUser(uModel.Username, refToken, DateTime.UtcNow.AddDays(1));
        }
        else
        {
            await UpdateRefreshTokenForUser(uModel.Username, Guid.Parse(refTokenGuid.ToString()), refToken, DateTime.UtcNow.AddDays(1));
        }

        return new Tokens()
        {
            RefreshToken = refToken,
            SessionToken = token
        };
    }
}