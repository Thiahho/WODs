using System.ComponentModel.DataAnnotations.Schema;

namespace CrossFitWOD.Entities;

[Table("Users")]
public class User
{
    [Column("id")]
    public int    Id           { get; set; }
    [Column("username")]
    public string Username     { get; set; } = string.Empty;
    [Column("passwordhash")]
    public string PasswordHash { get; set; } = string.Empty;
    
    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.Today;
    [Column("role")]
    public string Role         { get; set; } = "athlete";
    [Column("boxid")]
    public int    BoxId        { get; set; }

   
    public Box    Box          { get; set; } = null!;
}
