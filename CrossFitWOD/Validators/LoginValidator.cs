using CrossFitWOD.DTOs.Auth;
using FluentValidation;

namespace CrossFitWOD.Validators;

public class LoginValidator : AbstractValidator<LoginDto>
{
    public LoginValidator()
    {
        RuleFor(x => x.BoxId).NotEmpty();
        RuleFor(x => x.Secret).NotEmpty();
    }
}
