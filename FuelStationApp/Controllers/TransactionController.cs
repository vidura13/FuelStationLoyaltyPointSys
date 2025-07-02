using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FuelStationApp.Models;
using FuelStationApp.Dtos;
using Microsoft.AspNetCore.Authorization;

namespace FuelStationApp.Controllers
{
    [ApiController]
    [Authorize] // Ensure only admins can perform actions
    [Route("api/[controller]")]
    public class TransactionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TransactionController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string GenerateTransactionId()
        {
            Random random = new Random();
            string id;
            int retryCount = 0;
            const int maxRetries = 100; // Prevent infinite loops

            do
            {
                if (retryCount >= maxRetries)
                {
                    throw new InvalidOperationException("Failed to generate a unique Transaction ID after multiple attempts.");
                }

                int number = random.Next(100000, 999999); // Generate a random 6-digit number
                id = $"RL{number}"; // Prefix with "RL"
                retryCount++;

                // Check if the ID already exists in the database
                var exists = _context.Transactions.Any(t => t.Id == id);

            } while (_context.Transactions.Any(t => t.Id == id)); // Ensure uniqueness

            return id;
        }

        // POST: api/transaction
        [HttpPost]
        public async Task<ActionResult<Transaction>> RecordTransaction(CreateTransactionDto transactionDto)
        {
            // Validate the request payload
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Return validation errors
            }

            // Find the customer associated with the transaction
            var customer = await _context.Customers.FindAsync(transactionDto.CustomerId);
            if (customer == null)
            {
                return NotFound(new { message = "Customer not found." });
            }

            // Calculate loyalty points (e.g., 1 point per 1lkr)
            int loyaltyPointsEarned = (int)(transactionDto.Amount / 1);

            // Generate a unique Transaction ID
            string transactionId = GenerateTransactionId();

            // Create a new Transaction entity
            var transaction = new Transaction
            {
                Id = transactionId, // Assign the generated ID
                CustomerId = transactionDto.CustomerId,
                Amount = transactionDto.Amount,
                LoyaltyPointsEarned = loyaltyPointsEarned,
                Date = DateTime.UtcNow
            };

            // Add the transaction to the database
            _context.Transactions.Add(transaction);

            // Add loyalty points to the LoyaltyPoint table
            var loyaltyPoint = new LoyaltyPoint
            {
                Points = loyaltyPointsEarned,
                InputDate = DateTime.UtcNow,
                ExpirationDate = DateTime.UtcNow.AddMonths(12),
                CustomerId = transactionDto.CustomerId,
                TransactionId = transactionId
            };

            // Update the customer's total loyalty points
            customer.LoyaltyPoints += loyaltyPointsEarned;
            _context.Entry(customer).State = EntityState.Modified;

            // Save changes to the database
            _context.LoyaltyPoints.Add(loyaltyPoint);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving changes: {ex.Message}");
                return StatusCode(500, "An error occurred while saving the transaction.");
            }

            return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transaction);
        }

        // GET: api/transaction/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Transaction>> GetTransaction(string id)
        {
            var transaction = await _context.Transactions.FindAsync(id);

            if (transaction == null)
            {
                return NotFound(new { message = "Transaction not found." });
            }

            return transaction;
        }

        // DELETE: api/transaction/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTransaction(string id)
        {
            // Find the transaction by ID
            var transaction = await _context.Transactions
                .Include(t => t.Customer) // Include the related customer for updates
                .FirstOrDefaultAsync(t => t.Id == id);

            if (transaction == null)
            {
                return NotFound(new { message = "Transaction not found." });
            }

            // Find the loyalty points associated with the transaction
            var loyaltyPoints = await _context.LoyaltyPoints
                .Where(lp => lp.TransactionId == id) // Match loyalty points by TransactionId
                .ToListAsync();

            // Deduct loyalty points from the customer's total
            foreach (var loyaltyPoint in loyaltyPoints)
            {
                if (transaction.Customer == null)
                {
                    return StatusCode(500, "Customer associated with the transaction is missing.");
                }

                transaction.Customer.LoyaltyPoints -= loyaltyPoint.Points; // Deduct points
                _context.LoyaltyPoints.Remove(loyaltyPoint); // Remove the loyalty point record
            }

            // Remove the transaction
            _context.Transactions.Remove(transaction);

            // Save changes to the database
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while deleting the transaction: {ex.Message}");
            }

            return Ok(new { message = "Transaction deleted successfully." });
        }


        // GET: api/transaction/customer
        [HttpGet("customer")]
        public async Task<ActionResult> GetTransactionsByCustomer(
    [FromQuery] int? customerId = null,
    [FromQuery] DateTime? startDate = null,
    [FromQuery] DateTime? endDate = null,
    [FromQuery] string? sortField = null,
    [FromQuery] string? sortOrder = "asc")
        {
            // Validate customerId
            if (!customerId.HasValue)
            {
                return BadRequest(new { message = "Customer ID is required." });
            }

            // Validate sortField
            if (!string.IsNullOrEmpty(sortField) && !new[] { "date", "amount" }.Contains(sortField.ToLower()))
            {
                return BadRequest(new { message = "Invalid sortField. Allowed values: date, amount." });
            }

            // Validate sortOrder
            if (!string.IsNullOrEmpty(sortOrder) && !new[] { "asc", "desc" }.Contains(sortOrder.ToLower()))
            {
                return BadRequest(new { message = "Invalid sortOrder. Allowed values: asc, desc." });
            }

            // Base query
            var query = _context.Transactions
                .Join(
                    _context.Customers,
                    transaction => transaction.CustomerId,
                    customer => customer.Id,
                    (transaction, customer) => new TransactionWithCustomerDto
                    {
                        Id = transaction.Id,
                        CustomerId = transaction.CustomerId,
                        CustomerName = customer.Name,
                        Amount = transaction.Amount,
                        LoyaltyPointsEarned = transaction.LoyaltyPointsEarned,
                        Date = transaction.Date
                    }
                ).AsQueryable();

            // Apply customerId filter
            if (customerId.HasValue)
            {
                query = query.Where(t => t.CustomerId == customerId.Value);
            }

            // Check if the customer exists
            var customerExists = await _context.Customers.AnyAsync(c => c.Id == customerId.Value);
            if (!customerExists)
            {
                return NotFound(new { message = "Customer ID is invalid or does not exist." });
            }

            // Apply date filters
            if (startDate.HasValue)
            {
                query = query.Where(t => t.Date >= startDate.Value);
            }
            if (endDate.HasValue)
            {
                query = query.Where(t => t.Date <= endDate.Value);
            }

            // Apply sorting
            if (!string.IsNullOrEmpty(sortField))
            {
                switch (sortField.ToLower())
                {
                    case "date":
                        query = sortOrder == "asc"
                            ? query.OrderBy(t => t.Date)
                            : query.OrderByDescending(t => t.Date);
                        break;
                    case "amount":
                        query = sortOrder == "asc"
                            ? query.OrderBy(t => (double)t.Amount)
                            : query.OrderByDescending(t => (double)t.Amount);
                        break;
                }
            }

            // Fetch all matching transactions
            var transactions = await query.ToListAsync();

            // Check for results
            if (transactions == null || !transactions.Any())
            {
                return NotFound(new { message = "No transactions found for this customer." });
            }

            // Return data without metadata
            return Ok(new
            {
                Data = transactions
            });
        }

        // GET: api/transaction/GetAllLoyaltyPoints
        [HttpGet("all")]
        public IActionResult GetAllLoyaltyPoints(
    [FromQuery] string sortField = "points",
    [FromQuery] string sortOrder = "desc",
    [FromQuery] string? statusFilter = null,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
        {
            try
            {
                // Fetch all loyalty points
                var query = _context.LoyaltyPoints
                    .Select(lp => new
                    {
                        lp.Id,
                        lp.CustomerId,
                        lp.Points,
                        lp.ExpirationDate,
                        lp.InputDate,
                        Status = DateTime.UtcNow > lp.ExpirationDate ? "Expired" : "Available"
                    })
                    .AsQueryable();

                // Apply filtering by status
                if (!string.IsNullOrEmpty(statusFilter))
                {
                    query = statusFilter.ToLower() switch
                    {
                        "expired" => query.Where(lp => DateTime.UtcNow > lp.ExpirationDate),
                        "available" => query.Where(lp => DateTime.UtcNow <= lp.ExpirationDate),
                        _ => query // No filtering if statusFilter is invalid or empty
                    };
                }

                // Count total records before applying pagination
                var totalRecords = query.Count();
                var totalExpired = query.Count(lp => DateTime.UtcNow > lp.ExpirationDate);
                var totalAvailable = query.Count(lp => DateTime.UtcNow <= lp.ExpirationDate);

                // Apply sorting
                switch (sortField.ToLower())
                {
                    case "points":
                        query = sortOrder == "asc"
                            ? query.OrderBy(lp => lp.Points)
                            : query.OrderByDescending(lp => lp.Points);
                        break;
                    case "expirationdate":
                        query = sortOrder == "asc"
                            ? query.OrderBy(lp => lp.ExpirationDate)
                            : query.OrderByDescending(lp => lp.ExpirationDate);
                        break;
                    case "inputdate":
                        query = sortOrder == "asc"
                            ? query.OrderBy(lp => lp.InputDate)
                            : query.OrderByDescending(lp => lp.InputDate);
                        break;
                    default:
                        query = query.OrderByDescending(lp => lp.Points); // Default sorting
                        break;
                }

                // Apply pagination
                var paginatedResults = query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                // Return response
                return Ok(new
                {
                    TotalRecords = totalRecords,
                    TotalExpired = totalExpired,
                    TotalAvailable = totalAvailable,
                    PageSize = pageSize,
                    PageNumber = page,
                    Data = paginatedResults
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "An error occurred while fetching loyalty points.", error = ex.Message });
            }
        }
    }
}