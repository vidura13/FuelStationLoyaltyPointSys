using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FuelStationApp.Models;
using Microsoft.AspNetCore.Authorization;

namespace FuelStationApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CustomerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;


        public CustomerController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string GenerateCustomerId()
        {
            Random random = new Random();
            int id;
            do
            {
                id = random.Next(10000, 99999); // Generate a random 5-digit number
            } while (_context.Customers.Any(c => c.Id == id)); // Ensure uniqueness

            return id.ToString();
        }

        // GET: api/customer/all
        [HttpGet("all")]
        public async Task<ActionResult> GetAllCustomers(
            [FromQuery] string sortField = "name", // Default sort field
            [FromQuery] string sortOrder = "asc") // Default sort order
        {
            try
            {
                // Convert sortField to lowercase for validation
                string normalizedSortField = sortField.ToLower();

                if (!new[] { "name", "totalnonexpiredpoints", "totalexpiredpoints" }
                    .Contains(normalizedSortField))
                {
                    return BadRequest(new { message = "Invalid sortField. Allowed values: name, totalNonExpiredPoints, totalExpiredPoints." });
                }

                // Validate sortOrder
                if (!new[] { "asc", "desc" }.Contains(sortOrder.ToLower()))
                {
                    return BadRequest(new { message = "Invalid sortOrder. Allowed values: asc, desc." });
                }

                // Base query to fetch all customers
                var customers = await _context.Customers.ToListAsync();

                // Calculate total non-expired and expired loyalty points for each customer
                var customerDetails = await Task.WhenAll(customers.Select(async customer => new
                {
                    Id = customer.Id,
                    Name = customer.Name,
                    NIC = customer.NIC,
                    Phone = customer.PhoneNumber,
                    Email = customer.Email,
                    TotalNonExpiredPoints = await _context.LoyaltyPoints
                        .Where(lp => lp.CustomerId == customer.Id && lp.ExpirationDate >= DateTime.UtcNow)
                        .SumAsync(lp => lp.Points),
                    TotalExpiredPoints = await _context.LoyaltyPoints
                        .Where(lp => lp.CustomerId == customer.Id && lp.ExpirationDate < DateTime.UtcNow)
                        .SumAsync(lp => lp.Points)
                }));

                // Convert to a List to allow sorting
                var sortedCustomerDetails = customerDetails.ToList();

                // Apply sorting
                switch (sortField.ToLower())
                {
                    case "name":
                        sortedCustomerDetails = sortOrder == "asc"
                            ? sortedCustomerDetails.OrderBy(c => c.Name).ToList()
                            : sortedCustomerDetails.OrderByDescending(c => c.Name).ToList();
                        break;
                    case "totalnonexpiredpoints":
                        sortedCustomerDetails = sortOrder == "asc"
                            ? sortedCustomerDetails.OrderBy(c => c.TotalNonExpiredPoints).ToList()
                            : sortedCustomerDetails.OrderByDescending(c => c.TotalNonExpiredPoints).ToList();
                        break;
                    case "totalexpiredpoints":
                        sortedCustomerDetails = sortOrder == "asc"
                            ? sortedCustomerDetails.OrderBy(c => c.TotalExpiredPoints).ToList()
                            : sortedCustomerDetails.OrderByDescending(c => c.TotalExpiredPoints).ToList();
                        break;
                }

                // Return the data
                return Ok(new
                {
                    Data = sortedCustomerDetails
                });
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Error fetching all customers: {ex.Message}");

                // Return a 500 Internal Server Error response
                return StatusCode(500, "An error occurred while fetching all customers.");
            }
        }

        // GET: api/customer/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult> GetCustomerById(int id)
        {
            // Fetch the customer by ID
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound(new { message = "Customer not found." });
            }

            // Calculate total non-expired and expired loyalty points for the customer
            var totalNonExpiredPoints = await _context.LoyaltyPoints
                .Where(lp => lp.CustomerId == customer.Id && lp.ExpirationDate >= DateTime.UtcNow)
                .SumAsync(lp => lp.Points);

            var totalExpiredPoints = await _context.LoyaltyPoints
                .Where(lp => lp.CustomerId == customer.Id && lp.ExpirationDate < DateTime.UtcNow)
                .SumAsync(lp => lp.Points);

            return Ok(new
            {
                Id = customer.Id,
                Name = customer.Name,
                Phone = customer.PhoneNumber,
                Email = customer.Email,
                TotalNonExpiredPoints = totalNonExpiredPoints,
                TotalExpiredPoints = totalExpiredPoints
            });
        }

        // GET: api/customer/search?name
        [HttpGet("search")]
        public async Task<ActionResult> SearchCustomersByName([FromQuery] string name)
        {
            if (string.IsNullOrEmpty(name))
            {
                return BadRequest(new { message = "Name is required." });
            }

            // Search for customers by name (case-insensitive, partial match)
            var query = _context.Customers
                .Where(c => EF.Functions.Like(c.Name.ToLower(), $"%{name.ToLower()}%"));

            var customers = await query.ToListAsync();

            // If no customers are found, return 404
            if (customers.Count == 0)
            {
                return NotFound(new { message = "No customers found." });
            }

            // Calculate total non-expired and expired loyalty points for each customer
            var customerDetails = await Task.WhenAll(customers.Select(async customer => new
            {
                Id = customer.Id,
                Name = customer.Name,
                NIC = customer.NIC,
                Phone = customer.PhoneNumber,
                Email = customer.Email,
                TotalNonExpiredPoints = await _context.LoyaltyPoints
                    .Where(lp => lp.CustomerId == customer.Id && lp.ExpirationDate >= DateTime.UtcNow)
                    .SumAsync(lp => lp.Points),
                TotalExpiredPoints = await _context.LoyaltyPoints
                    .Where(lp => lp.CustomerId == customer.Id && lp.ExpirationDate < DateTime.UtcNow)
                    .SumAsync(lp => lp.Points)
            }));

            return Ok(customerDetails);
        }

        // POST: api/customer
        [HttpPost]
        public async Task<ActionResult<Customer>> CreateCustomer(Customer customer)
        {
            // Validate NIC length
            if (string.IsNullOrEmpty(customer.NIC) || customer.NIC.Length != 12)
            {
                return BadRequest("NIC must be exactly 12 characters long.");
            }

            // Generate a unique 5-digit Customer ID
            customer.Id = int.Parse(GenerateCustomerId());

            // Save the customer to the database
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCustomerById), new { id = customer.Id }, customer);
        }

        // PUT: api/customer/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomer(int id, [FromBody] Customer updatedCustomer)
        {
            // Validate that the ID in the route matches the ID in the request body
            if (id != updatedCustomer.Id)
            {
                return BadRequest(new { message = "Customer ID mismatch." });
            }

            // Log the received NIC value and its length
            Console.WriteLine($"Received NIC: {updatedCustomer.NIC}, Length: {updatedCustomer.NIC?.Length}");

            // Find the existing customer by ID
            var existingCustomer = await _context.Customers.FindAsync(id);
            if (existingCustomer == null)
            {
                return NotFound(new { message = "Customer not found." });
            }

            // Log received values
            Console.WriteLine($"Received Name: {updatedCustomer.Name}");
            Console.WriteLine($"Received NIC: {updatedCustomer.NIC}");
            Console.WriteLine($"Received Email: {updatedCustomer.Email}");
            Console.WriteLine($"Received PhoneNumber: {updatedCustomer.PhoneNumber}");

            // Update only fields with meaningful, non-default values
            if (!string.IsNullOrEmpty(updatedCustomer.Name) && updatedCustomer.Name != "string")
            {
                existingCustomer.Name = updatedCustomer.Name;
            }
            if (!string.IsNullOrEmpty(updatedCustomer.NIC) && updatedCustomer.NIC != "string")
            {
                if (updatedCustomer.NIC != null && updatedCustomer.NIC.Length == 12)
                {
                    existingCustomer.NIC = updatedCustomer.NIC;
                    Console.WriteLine($"Updated NIC to: {existingCustomer.NIC}");
                }
                else
                {
                    return BadRequest(new { message = "NIC must be exactly 12 characters long." });
                }
            }
            if (!string.IsNullOrEmpty(updatedCustomer.Email) && updatedCustomer.Email != "string")
            {
                existingCustomer.Email = updatedCustomer.Email;
            }
            if (!string.IsNullOrEmpty(updatedCustomer.PhoneNumber) && updatedCustomer.PhoneNumber != "string")
            {
                existingCustomer.PhoneNumber = updatedCustomer.PhoneNumber;
            }

            // Save the updated customer to the database
            try
            {
                await _context.SaveChangesAsync();
                Console.WriteLine($"Updated NIC in database: {existingCustomer.NIC}");
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!CustomerExists(id))
                {
                    return NotFound(new { message = "Customer not found." });
                }
                else
                {
                    throw;
                }
            }
            //updated
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving changes: {ex.Message}");
                throw;
            }

            return NoContent();
        }

        // DELETE: api/customer/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound(new { message = "Customer not found." });
            }

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CustomerExists(int id)
        {
            return _context.Customers.Any(e => e.Id == id);
        }
    }
}