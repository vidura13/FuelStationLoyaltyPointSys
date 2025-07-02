namespace FuelStationApp.Models
{
    public class Customer
    {
        public int Id { get; set; } // Unique ID for the customer
        public string Name { get; set; } = string.Empty; // Customer's full name
        public string Email { get; set; } = string.Empty; // Customer's email address
        public string PhoneNumber { get; set; } = string.Empty; // Customer's phone number
        public int LoyaltyPoints { get; set; } = 0; // Loyalty points (default is 0)
        public string NIC { get; set; } = string.Empty; //customre NIC
    }
}