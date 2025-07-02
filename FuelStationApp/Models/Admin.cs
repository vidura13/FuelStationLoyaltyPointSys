using BCrypt.Net;

namespace FuelStationApp.Models
{
    public class Admin
    {
        public int Id { get; set; } // Unique ID for the admin
        public string Username { get; set; } = string.Empty;

        private string _passwordHash = string.Empty;

        public string PasswordHash
        {
            get => _passwordHash;
            set => _passwordHash = BCrypt.Net.BCrypt.HashPassword(value); // Automatically hash the password
        }

        public bool VerifyPassword(string password)
        {
            return BCrypt.Net.BCrypt.Verify(password, _passwordHash); // Verify the password
        }
    }
}