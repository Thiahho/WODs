using CrossFitWOD.Enums;

namespace CrossFitWOD.Services;

public static class ScalingCalculator
{
    public static float InitialFactor(AthleteLevel level, AthleteGoal goal)
    {
        float base_ = level switch
        {
            AthleteLevel.Beginner     => 0.8f,
            AthleteLevel.Intermediate => 1.0f,
            AthleteLevel.Advanced     => 1.2f,
            _                         => 1.0f
        };

        float modifier = goal switch
        {
            AthleteGoal.Competition    =>  0.1f,
            AthleteGoal.Rehabilitation => -0.2f,
            _                          =>  0f
        };

        return Math.Clamp(base_ + modifier, 0.5f, 1.5f);
    }

    public static float AdjustFactor(float current, bool completed, int rpe, AthleteGoal goal)
    {
        float step = goal switch
        {
            AthleteGoal.Competition    => 0.15f,
            AthleteGoal.Rehabilitation => 0.05f,
            _                          => 0.10f
        };

        float max = goal == AthleteGoal.Rehabilitation ? 1.0f : 1.5f;

        float next = current;
        if (!completed && rpe >= 7)
            next -= step;           // no terminó Y fue difícil
        else if (completed && rpe >= 9)
            next -= step;           // terminó pero al límite
        else if (completed && rpe <= 6)
            next += step;           // terminó y fue fácil
        // !completed && rpe <= 6 → sin cambio (no terminó por tiempo, no por dificultad)

        return Math.Clamp(next, 0.5f, max);
    }
}
