using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using PasswordManager.Models.Models;
using PasswordManager.Models.Models.RequestModels;
using PasswordManager.Models.Static;
using PasswordManager.Security.Interfaces;

namespace PasswordManager.Controllers;

[Route("api/v{version:apiVersion}/auth")]
[ApiController]
[ApiVersion("1.0")]
public class AuthControllerV1 : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IAuthServiceV1 _authService;

    public AuthControllerV1(IConfiguration configuration, IAuthServiceV1 authServiceV1)
    {
        _configuration = configuration;
        _authService = authServiceV1;
    }

    /*
     * Endpoint to login user
     */
    [AllowAnonymous]
    [HttpPost]
    [Route("login")]
    public async Task<ActionResult> Login([FromBody]UserRequestModel userRequestModel)
    {
        var tokens = await _authService.AuthLoginUserAsync(userRequestModel.Username, userRequestModel.Password);
        if (tokens == null)
            return new UnauthorizedResult();
        
        return Ok(tokens);
    }
    
    /*
     * Endpoint to register user
     */
    [AllowAnonymous]
    [HttpPost]
    [Route("register")]
    public async Task<ActionResult> Register([FromBody] UserRequestModel userRequestModel)
    {
        var sessionToken =
            await _authService.AuthRegisterUserAsync(userRequestModel.Username, userRequestModel.Password);
        
        if (sessionToken == null)
            return new UnauthorizedResult();
        
        return Ok(sessionToken);
    }

    /*
     * Endpoint to get a refresh token to keep session alive
     */
    [AllowAnonymous]
    [HttpPost("refresh-token")]
    public async Task<ActionResult> RefreshToken(Tokens tokens)
    {
        if (tokens == null)
            return BadRequest();

        var token = await _authService.GetRefreshToken(tokens);
        if (token == null)
            return BadRequest("Something went wrong trying to generate token");

        return Ok(token);
    }
    /*
        Endpoint to check if the user has 2FA enabled
    */
    [Authorize(AuthenticationSchemes = "TfaScheme")]
    [HttpGet("2fa/isActive")]
    public async Task<ActionResult> CheckTwoStep()
    {
        var userGuidClaim = User.Claims.First(x => x.Type == ClaimCodes.UserGuidClaim);
        var userGuid = new Guid(userGuidClaim.Value);

        var res = await _authService.is2StepSetup(userGuid);

        return Ok(res);
    }
    
    /*
     * Endpoint for setting up 2FA for user
     */
    [Authorize(AuthenticationSchemes = "TfaScheme")]
    [HttpPost("2fa/setup")]
    public async Task<ActionResult> SetupTwoStep()
    {
        var userGuidClaim = User.Claims.First(x => x.Type == ClaimCodes.UserGuidClaim);
        var userGuid = new Guid(userGuidClaim.Value);

        var res = await _authService.Setup2StepVerification(userGuid);

        return Ok(res);
    }
    /*
     * Endpoint for verifying the 2FA code for user
     */
    [Authorize(AuthenticationSchemes = "TfaScheme")]
    [HttpPost("2fa/verify")]
    public async Task<ActionResult> ValidateTwoStep([FromBody] TfaCode code)
    {
        var userGuidClaim = User.Claims.First(x => x.Type == ClaimCodes.UserGuidClaim);
        var userGuid = new Guid(userGuidClaim.Value);

        var res = await _authService.VerifyTwoStepCode(userGuid, code.code);

        return Ok(res);
    }

    /*
     * Endpoint for getting basic info for the authenticated user
     */
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpGet("user")]
    public async Task<ActionResult> GetUserInfo()
    {
        var userGuidClaim = User.Claims.First(x => x.Type == ClaimCodes.UserGuidClaim);
        var userGuid = new Guid(userGuidClaim.Value);

        var u = await _authService.GetUserByGuidAsync(userGuid);

        return Ok(new UserModel(){Username = u.Username, UserId = u.UserId, UserGuid = u.UserGuid, hasTwoStep = u.hasTwoStep});
    }
}