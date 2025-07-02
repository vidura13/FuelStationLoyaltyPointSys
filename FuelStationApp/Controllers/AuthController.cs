using Microsoft.AspNetCore.Mvc;
using FuelStationApp.Models;
using FuelStationApp.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;

namespace FuelStationApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            // Find the admin by username
            var admin = await _context.Admins.FirstOrDefaultAsync(a => a.Username == model.Username);
            if (admin == null)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            // Verify the password
            bool passwordVerificationResult = admin.VerifyPassword(model.Password);
            if (!passwordVerificationResult)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            // Generate a JWT token
            var token = JwtHelper.GenerateToken(admin.Username, _configuration);

            return Ok(new { token });
        }
    }
}