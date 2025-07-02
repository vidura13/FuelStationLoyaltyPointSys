using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace FuelStationApp.Dtos
{
    public class CreateTransactionDto
    {
        [Required(ErrorMessage = "Customer ID is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Customer ID must be a positive number.")]
        [DefaultValue(0)] //default value for Swagger
        public int CustomerId { get; set; }

        [Required(ErrorMessage = "Transaction amount is required.")]
        [Range(0.00, double.MaxValue, ErrorMessage = "Transaction amount must be greater than 0.")]
        public decimal Amount { get; set; }
    }
}