using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FuelStationApp.Models;
using System.Linq;
using Microsoft.AspNetCore.Authorization;

namespace FuelStationApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LoyaltyPointsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LoyaltyPointsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/loyaltypoints/customer/{customerId}
        [HttpGet("customer/{customerId}")]
        public IActionResult GetNonExpiredLoyaltyPoints(int customerId)
        {
            try
            {
                // Fetch non-expired loyalty points for the customer, sorted by ExpirationDate
                var loyaltyPoints = _context.LoyaltyPoints
                    .Where(lp => lp.CustomerId == customerId && lp.ExpirationDate > DateTime.UtcNow)
                    .OrderBy(lp => lp.ExpirationDate)
                    .ToList();

                return Ok(loyaltyPoints);
            }
            catch (Exception ex)
            {
                // Log the error and return a 500 response
                Console.WriteLine($"Error fetching loyalty points: {ex.Message}");
                return StatusCode(500, "An error occurred while fetching loyalty points.");
            }
        }

        // POST: api/loyaltypoints/redeem
        [HttpPost("redeem")]
        public async Task<IActionResult> RedeemLoyaltyPoints([FromBody] RedemptionRequest request)
        {
            try
            {
                // Validate input
                if (request == null || request.CustomerId <= 0 || request.RedemptionAmount <= 0)
                {
                    return BadRequest("Invalid input. Please provide a valid CustomerId and RedemptionAmount.");
                }

                // Fetch non-expired loyalty points for the customer, sorted by ExpirationDate
                var loyaltyPoints = await _context.LoyaltyPoints
                    .Where(lp => lp.CustomerId == request.CustomerId && lp.ExpirationDate > DateTime.UtcNow)
                    .OrderBy(lp => lp.ExpirationDate)
                    .ToListAsync();

                // Calculate total available points
                int totalAvailablePoints = loyaltyPoints.Sum(lp => lp.Points);

                // Check if the customer has enough points
                if (totalAvailablePoints < request.RedemptionAmount)
                {
                    return BadRequest("Balance not enough. Insufficient loyalty points.");
                }

                // Deduct points starting from the earliest expiring entry
                int remainingRedemptionAmount = request.RedemptionAmount;

                foreach (var loyaltyPoint in loyaltyPoints)
                {
                    if (remainingRedemptionAmount <= 0) break;

                    int pointsToDeduct = Math.Min(loyaltyPoint.Points, remainingRedemptionAmount);
                    loyaltyPoint.Points -= pointsToDeduct;
                    remainingRedemptionAmount -= pointsToDeduct;

                    // If the points become zero, mark it as expired (optional, depending on your business logic)
                    if (loyaltyPoint.Points == 0)
                    {
                        loyaltyPoint.ExpirationDate = DateTime.UtcNow; // Mark as expired
                    }
                }

                // Save changes to the LoyaltyPoints table
                await _context.SaveChangesAsync();

                // Record the redemption in the Redemptions table
                var redemption = new Redemption
                {
                    CustomerId = request.CustomerId,
                    RedemptionAmount = request.RedemptionAmount,
                    RedemptionDate = DateTime.UtcNow
                };

                _context.Redemptions.Add(redemption);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Redemption successful.", redemption });
            }
            catch (Exception ex)
            {
                // Log the error and return a 500 response
                Console.WriteLine($"Error redeeming loyalty points: {ex.Message}");
                return StatusCode(500, "An error occurred while redeeming loyalty points.");
            }
        }
    }

    // Request model for redemption
    public class RedemptionRequest
    {
        public int CustomerId { get; set; }
        public int RedemptionAmount { get; set; }
    }
}