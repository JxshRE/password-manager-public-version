using Asp.Versioning;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PasswordManager.Models.Mappers;
using PasswordManager.Models.Models;
using PasswordManager.Models.Models.RequestModels;
using PasswordManager.Models.Static;
using PasswordManager.Security.Interfaces;

namespace PasswordManager.Controllers;

[Route("api/v{version:apiVersion}/passwords")]
[ApiController]
[ApiVersion("1.0")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class PasswordsController : ControllerBase
{
    private readonly IPasswordServiceV1 _passwordServiceV1;
    public PasswordsController(IPasswordServiceV1 passwordServiceV1)
    {
        _passwordServiceV1 = passwordServiceV1;
    }
    
    /*
     * Endpoint to get user password entries
     */
    [HttpGet("get")]
    public async Task<ActionResult> GetPasswords()
    {
        var userGuidClaim = User.Claims.First(x => x.Type == ClaimCodes.UserGuidClaim);
        var userGuid = new Guid(userGuidClaim.Value);
        var passwords = await _passwordServiceV1.GetPasswordsForUser(userGuid);
        return Ok(passwords.Select(x => x.ToModel()));
    }
    
    /*
     * Endpoint to get specific password entry
     */
    [HttpGet("get/{passwordGuid}")]
    public async Task<ActionResult> GetPasswords(Guid passwordGuid)
    {
        var userGuidClaim = User.Claims.First(x => x.Type == ClaimCodes.UserGuidClaim);
        var userGuid = new Guid(userGuidClaim.Value);
        var password = await _passwordServiceV1.GetPasswordsForUserByGuid(userGuid, passwordGuid);
        if (password == null)
            return BadRequest("Password not found!");
        return Ok(password?.ToModel());
    }

    /*
     * Endpoint to add a password entry to user
     */
    [HttpPost("add")]
    public async Task<ActionResult> AddPassword([FromBody] PasswordAddRequestModel toAdd)
    {
        var userGuidClaim = User.Claims.First(x => x.Type == ClaimCodes.UserGuidClaim);
        var userGuid = new Guid(userGuidClaim.Value);

        var model = new PasswordModel()
        {
            Password = toAdd.Password,
            Username = toAdd.Username,
            Title = toAdd.Title,
            Notes = toAdd.Notes ?? null
        };
        var res = await _passwordServiceV1.AddPasswordForUser(userGuid, model);
        return Ok(res);
    }

    /*
     * Endpoint to update existing password entry
     */
    [HttpPut("update")]
    public async Task<ActionResult> UpdatePassword([FromBody] PasswordModel toAdd)
    {
        var userGuidClaim = User.Claims.First(x => x.Type == ClaimCodes.UserGuidClaim);
        var userGuid = new Guid(userGuidClaim.Value);

        var upd = await _passwordServiceV1.UpdatePasswordForUser(userGuid, toAdd);
        if (upd == null)
            return BadRequest("Failed to update password");

        return Ok(upd);
    }
    
    /*
     * Endpoint to delete an existing password entry for user
     */
    [HttpDelete("remove/{passwordGuid}")]
    public async Task<ActionResult> DeletePassword(Guid passwordGuid)
    {
        var userGuidClaim = User.Claims.First(x => x.Type == ClaimCodes.UserGuidClaim);
        var userGuid = new Guid(userGuidClaim.Value);

        var rem = await _passwordServiceV1.DeletePassword(userGuid, passwordGuid);
        if (!rem)
            return BadRequest("Failed to remove password entry!");
        return Ok(rem);

    }
}