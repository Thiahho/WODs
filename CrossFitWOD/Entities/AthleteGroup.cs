using System.ComponentModel.DataAnnotations.Schema;

namespace CrossFitWOD.Entities;

[Table("AthleteGroups")]
public class AthleteGroup
{
    [Column("groupid")]
    public int GroupId { get; set; }
    public Group Group { get; set; } = null!;

    [Column("athleteid")]
    public int AthleteId { get; set; }
    public Athlete Athlete { get; set; } = null!;
}
