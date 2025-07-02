namespace FuelStationApp.Models
{
    public class Redemption
    {
        public int Id { get; set; } // Primary key
        public int CustomerId { get; set; } // Foreign key to Customer
        public int RedemptionAmount { get; set; } // Total points redeemed
        public DateTime RedemptionDate { get; set; } // Date of redemption

        // Navigation property (optional)
        public Customer? Customer { get; set; }
    }
}