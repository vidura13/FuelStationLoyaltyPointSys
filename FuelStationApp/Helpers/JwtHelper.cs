using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FuelStationApp.Helpers
{
    public static class JwtHelper
    {
        public static string GenerateToken(string username, IConfiguration configuration)
        {
            // Retrieve settings from appsettings.json with null checks
            var secretKey = configuration["Jwt:Key"]; 
            var issuer = configuration["Jwt:Issuer"]; 
            var audience = configuration["Jwt:Audience"]; 

            // Validate that required settings are not null
            if (string.IsNullOrEmpty(secretKey) || string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience))
            {
                throw new InvalidOperationException("JWT settings are missing or invalid in appsettings.json.");
            }

            // Create the secret key for signing
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Define claims (e.g., username)
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, username)
            };

            // Create the token
            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(60), // Hardcoded expiry for simplicity
                signingCredentials: signingCredentials
            );

            // Return the token as a string
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}