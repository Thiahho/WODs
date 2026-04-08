using System.ComponentModel.DataAnnotations.Schema;

namespace CrossFitWOD.Entities;

[Table("Groups")]
public class Group
{
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Column("boxid")]
    public int BoxId { get; set; }
    public Box Box { get; set; } = null!;

    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<AthleteGroup> AthleteGroups { get; set; } = [];
}
