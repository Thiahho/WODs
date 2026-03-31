using CrossFitWOD.DTOs.WorkoutResult;
using FluentValidation;

namespace CrossFitWOD.Validators;

public class RegisterResultValidator : AbstractValidator<RegisterResultDto>
{
    public RegisterResultValidator()
    {
        RuleFor(x => x.AthleteWorkoutId).NotEmpty();
        RuleFor(x => x.Rpe).InclusiveBetween(1, 10)
            .WithMessage("RPE debe estar entre 1 y 10.");
        RuleFor(x => x.TimeSeconds).GreaterThan(0)
            .When(x => x.TimeSeconds.HasValue)
            .WithMessage("TimeSeconds debe ser mayor que 0.");
        RuleFor(x => x.Rounds).GreaterThan(0)
            .When(x => x.Rounds.HasValue)
            .WithMessage("Rounds debe ser mayor que 0.");
    }
}
