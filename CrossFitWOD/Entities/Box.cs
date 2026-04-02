using CrossFitWOD.Enums;

namespace CrossFitWOD.Entities;

public class Box
{
    public int     Id                  { get; set; }
    public string  Name                { get; set; } = string.Empty;
    public string  Slug                { get; set; } = string.Empty;
    public bool    IsIndividual        { get; set; } = false;
    public string  SubscriptionStatus  { get; set; } = "trial";
    public DateTime? TrialEndsAt       { get; set; }
    public DateTime? SubscriptionEndsAt { get; set; }
    public bool    Active              { get; set; } = true;
    public DateTime CreatedAt          { get; set; } = DateTime.UtcNow;

    // Nav
    public ICollection<User>    Users    { get; set; } = [];
    public ICollection<Athlete> Athletes { get; set; } = [];
}