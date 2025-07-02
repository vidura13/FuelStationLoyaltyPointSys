using System.ComponentModel.DataAnnotations.Schema;
namespace FuelStationApp.Models
{
    public class LoyaltyPoint
    {
        public int Id { get; set; } // Unique ID for the loyalty points record
        public int Points { get; set; } // Number of loyalty points

        [Column(TypeName = "DATETIME")] // Date when points were added
        public DateTime InputDate { get; set; }

        [Column(TypeName = "DATETIME")] // Date when points expire
        public DateTime ExpirationDate { get; set; }

        // Foreign key to link loyalty points to a customer
        public int CustomerId { get; set; }

        //foreign key to link to the transaction
        public string? TransactionId { get; set; } // Matches the ID of the transaction
        public Transaction? Transaction { get; set; } // Navigation property

        // Navigation property
        public Customer? Customer { get; set; } // Nullable to avoid warnings
    }
}