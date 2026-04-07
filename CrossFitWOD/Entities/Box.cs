using System.ComponentModel.DataAnnotations.Schema;
using CrossFitWOD.Enums;

namespace CrossFitWOD.Entities;

[Table("Boxes")]
public class Box
{
    [Column("id")]
    public int     Id                  { get; set; }
    [Column("name")]
    public string  Name                { get; set; } = string.Empty;
    [Column("slug")]
    public string  Slug                { get; set; } = string.Empty;
    [Column("isindividual")]
    public bool    IsIndividual        { get; set; } = false;
    [Column("subscriptionstatus")]
    public string  SubscriptionStatus  { get; set; } = "trial";
    [Column("trialendsat")]
    public DateTime? TrialEndsAt       { get; set; }
    [Column("subscriptionendsat")]
    public DateTime? SubscriptionEndsAt { get; set; }
    [Column("active")]
    public bool    Active              { get; set; } = true;
    [Column("createdat")]
    public DateTime CreatedAt          { get; set; } = DateTime.UtcNow;

    // Nav
    public ICollection<User>    Users    { get; set; } = [];
    public ICollection<Athlete> Athletes { get; set; } = [];
}