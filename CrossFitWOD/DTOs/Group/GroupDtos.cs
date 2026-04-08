namespace CrossFitWOD.DTOs.Group;

public record CreateGroupDto(string Name, string? Description, List<int>? AthleteIds);
public record UpdateGroupDto(string Name, string? Description);
public record AthleteInGroupDto(int Id, string Name, string Level);
public record GroupResponseDto(
    int Id,
    string Name,
    string? Description,
    DateTime CreatedAt,
    List<AthleteInGroupDto> Athletes);
