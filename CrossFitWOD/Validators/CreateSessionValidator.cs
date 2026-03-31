using CrossFitWOD.DTOs.WorkoutSession;
using FluentValidation;

namespace CrossFitWOD.Validators;

public class CreateSessionValidator : AbstractValidator<CreateSessionDto>
{
    public CreateSessionValidator()
    {
        RuleFor(x => x.WodId).NotEmpty();
        RuleFor(x => x.Date).NotEmpty()
            .GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("La fecha de la sesión no puede ser en el pasado.");
    }
}
