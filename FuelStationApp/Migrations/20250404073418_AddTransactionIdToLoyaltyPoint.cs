using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FuelStationApp.Migrations
{
    /// <inheritdoc />
    public partial class AddTransactionIdToLoyaltyPoint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TransactionId",
                table: "LoyaltyPoints",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyPoints_TransactionId",
                table: "LoyaltyPoints",
                column: "TransactionId");

            migrationBuilder.AddForeignKey(
                name: "FK_LoyaltyPoints_Transactions_TransactionId",
                table: "LoyaltyPoints",
                column: "TransactionId",
                principalTable: "Transactions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoyaltyPoints_Transactions_TransactionId",
                table: "LoyaltyPoints");

            migrationBuilder.DropIndex(
                name: "IX_LoyaltyPoints_TransactionId",
                table: "LoyaltyPoints");

            migrationBuilder.DropColumn(
                name: "TransactionId",
                table: "LoyaltyPoints");
        }
    }
}
