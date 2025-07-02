using Microsoft.EntityFrameworkCore;
using FuelStationApp.Models;

namespace FuelStationApp
{
    public class ApplicationDbContext : DbContext
    {
        // Constructor to inject DbContext options
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSet properties for each model
        public DbSet<Admin> Admins { get; set; } //Admin entity
        public DbSet<Customer> Customers { get; set; } //Customer entity
        public DbSet<Transaction> Transactions { get; set; } //Transaction entity
        public DbSet<LoyaltyPoint> LoyaltyPoints { get; set; }  //LoyaltyPoints entity
         public DbSet<Redemption> Redemptions { get; set; } // Redemption entity
    }
}