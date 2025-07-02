using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace FuelStationApp.Dtos
{
    public class TransactionWithCustomerDto
    {
        public string Id { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public decimal Amount { get; set; }
        public int LoyaltyPointsEarned { get; set; }
        public DateTime Date { get; set; }
    }
}