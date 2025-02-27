using Microsoft.EntityFrameworkCore;
using PasswordManager.Repository.Entities;

namespace PasswordManager.Repository;

public class PasswordManagerContext : DbContext
{
    public DbSet<User> User { get; set; }
    public DbSet<PasswordGroup> PasswordGroup { get; set; }
    public DbSet<Password> Password { get; set; }
    public DbSet<RefreshToken> RefreshToken { get; set; }

    public PasswordManagerContext(DbContextOptions<PasswordManagerContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PasswordGroup>()
            .HasOne(e => e.OwnerUser)
            .WithMany(e => e.PasswordGroups)
            .HasForeignKey(e => e.Owner)
            .HasPrincipalKey(e => e.Id);

        modelBuilder.Entity<RefreshToken>()
            .HasOne(x => x.User)
            .WithMany(z => z.RefreshTokens)
            .HasForeignKey(x => x.UserId)
            .HasPrincipalKey(z => z.Id);

        modelBuilder.Entity<Password>()
            .HasOne(e => e.PasswordGroup)
            .WithMany(x => x.Passwords)
            .HasForeignKey(x => x.PasswordGroupId)
            .HasPrincipalKey(x => x.Id);
    }
    
    
}