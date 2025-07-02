using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace FuelStationApp.Controllers
{
    [ApiController]
    [Authorize] // Ensure only admins can perform actions
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Constructor to inject the DbContext
        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/dashboard
        [HttpGet("dashboard")]
        public async Task<ActionResult> GetAdminDashboard()
        {
            // Calculate total non-expired loyalty points
            var totalNonExpiredPoints = await _context.LoyaltyPoints
                .Where(lp => lp.ExpirationDate >= DateTime.UtcNow)
                .SumAsync(lp => lp.Points);

            // Calculate total expired loyalty points
            var totalExpiredPoints = await _context.LoyaltyPoints
                .Where(lp => lp.ExpirationDate < DateTime.UtcNow)
                .SumAsync(lp => lp.Points);

            // Calculate total number of customers
            var totalCustomers = await _context.Customers.CountAsync();

            // Return the dashboard data
            return Ok(new
            {
                TotalNonExpiredPoints = totalNonExpiredPoints,
                TotalExpiredPoints = totalExpiredPoints,
                TotalCustomers = totalCustomers
            });
        }
    }
}