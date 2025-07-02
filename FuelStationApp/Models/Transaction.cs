using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace FuelStationApp.Models
{
    public class Transaction
    {
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)] // Exclude only when writing default values
        public string Id { get; set; } = string.Empty; // Unique ID for the transaction

        [Required]
        public int CustomerId { get; set; } // Foreign key to link to the customer

        [Required]
        public decimal Amount { get; set; } // Transaction amount

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public int LoyaltyPointsEarned { get; set; } // Loyalty points earned from this transaction

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public DateTime Date { get; set; } = DateTime.UtcNow; // Timestamp of the transaction

        public string? Type { get; set; } // e.g., "Fuel Purchase"

        // Navigation property to associate the transaction with a customer
        [JsonIgnore]
        public Customer? Customer { get; set; }
    }
}