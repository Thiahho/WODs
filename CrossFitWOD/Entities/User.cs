namespace CrossFitWOD.Entities;

public class User
{
    public int    Id           { get; set; }
    public string Username     { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role         { get; set; } = "athlete";
    public int    BoxId        { get; set; }
    public Box    Box          { get; set; } = null!;
}
