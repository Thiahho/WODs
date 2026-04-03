# Generación de WODs — Cómo funciona

## Cuándo se genera un WOD automático

Solo se genera un WOD automáticamente cuando **el box es individual** (`Box.IsIndividual = true`). Si el box tiene coach, el WOD debe ser cargado manualmente. El trigger es la primera llamada a `GET /api/athlete-workouts/today/{athleteId}` del día si no existe sesión.

---

## Parámetros del atleta que afectan el WOD

| Campo en `Athlete`        | Tipo            | Efecto en el WOD |
|---------------------------|-----------------|------------------|
| `Goal`                    | `AthleteGoal`   | Determina qué pool de ejercicios se usa |
| `Level`                   | `AthleteLevel`  | Multiplica las reps base y define duración por defecto |
| `Equipment`               | `string` (CSV)  | Filtra ejercicios por equipamiento disponible |
| `WeakPoints`              | `string` (CSV)  | Sesga la selección hacia ejercicios que trabajen esas debilidades |
| `SessionDurationMinutes`  | `int`           | Duración del WOD (si es 0, usa el default por nivel) |

---

## 1. Goal → Pool de ejercicios

Cada `AthleteGoal` tiene su propio catálogo de ejercicios dividido en tres categorías:

| Goal              | Catálogo                                               | Categorías usadas |
|-------------------|--------------------------------------------------------|-------------------|
| `General`         | Ejercicios básicos bodyweight + kettlebell             | 2 de 3 (cardio, gymnastics, loaded) |
| `Fitness`         | Pull-ups, Toes-to-Bar, Deadlifts — más técnico        | 2 de 3 |
| `Competition`     | Thrusters, Cleans, Chest-to-Bar — mayor demanda       | **3 de 3** (siempre las 3 categorías) |
| `Rehabilitation`  | Movimientos de bajo impacto, sin saltos ni cargas altas | 2 de 3 |

Las categorías que se usan en el día se eligen **aleatoriamente** (semilla `athleteId + dayNumber`, es decir, siempre el mismo resultado para el mismo atleta en el mismo día — es determinista).

---

## 2. Equipment → Filtro de ejercicios

Cada ejercicio declara el equipamiento que requiere (por ejemplo: `["kettlebell"]`, `["barbell"]`, `["pullup_bar"]`). Solo se incluyen ejercicios donde el atleta tiene **todo** el equipo listado.

Si ningún ejercicio de una categoría está disponible con el equipo del atleta, se usa un **fallback bodyweight**:

| Categoría   | Fallback          |
|-------------|-------------------|
| `cardio`    | Burpees (10 reps) |
| `gymnastics`| Push-ups (15 reps)|
| `loaded`    | Air Squats (20 reps)|

---

## 3. WeakPoints → Selección ponderada

Una vez filtrados los ejercicios por equipo, la selección no es puramente aleatoria. Los ejercicios que entrenan un dominio marcado como punto débil del atleta tienen **3× más probabilidad** de ser elegidos.

Dominios disponibles: `cardio`, `strength`, `gymnastics`, `weightlifting`, `flexibility`.

Ejemplo: si el atleta tiene `WeakPoints = "cardio,gymnastics"`, un Pull-up (dominio `gymnastics`) tiene 3× más peso que un Goblet Squat (dominio `strength`).

---

## 4. Level → Reps y duración

Las reps de cada ejercicio se calculan como:

```
reps = round(BaseReps × RepMultiplier(Level))
```

| Level          | Multiplicador | Duración default |
|----------------|---------------|-----------------|
| `Beginner`     | × 0.6         | 15 min          |
| `Intermediate` | × 1.0         | 20 min          |
| `Advanced`     | × 1.4         | 30 min          |

Si el atleta tiene `SessionDurationMinutes > 0`, ese valor sobreescribe el default.

---

## 5. Día de la semana → Tipo de WOD

El tipo de WOD es fijo según el día:

| Día        | Tipo      |
|------------|-----------|
| Lunes      | For Time  |
| Martes     | AMRAP     |
| Miércoles  | EMOM      |
| Jueves     | For Time  |
| Viernes    | AMRAP     |
| Sábado     | For Time  |
| Domingo    | EMOM      |

---

## 6. ScaledRepsFactor — Factor de escala dinámico

Independientemente del WOD generado, cada `AthleteWorkout` tiene un `ScaledRepsFactor` que escala las reps del WOD **en tiempo de ejecución** (rango `[0.5, 1.5]`).

### Factor inicial (primer WOD)

Se calcula combinando nivel y objetivo:

| Level          | Base |
|----------------|------|
| `Beginner`     | 0.8  |
| `Intermediate` | 1.0  |
| `Advanced`     | 1.2  |

Luego se aplica un modificador por goal:

| Goal              | Modificador |
|-------------------|-------------|
| `Competition`     | +0.1        |
| `Rehabilitation`  | −0.2        |
| `General/Fitness` | 0           |

Resultado = `Clamp(base + modifier, 0.5, 1.5)`.

### Ajuste tras cada resultado (RPE feedback)

Después de registrar un resultado (`POST /api/workout-results`), el factor se ajusta para el **próximo WOD**:

| Condición                              | Cambio           |
|----------------------------------------|------------------|
| No completó **o** RPE ≥ 9             | − step           |
| Completó y RPE ≤ 6                    | + step           |
| Completó y RPE 7–8                    | sin cambio       |

El `step` varía por goal:

| Goal              | Step  | Máximo factor |
|-------------------|-------|---------------|
| `Competition`     | 0.15  | 1.5           |
| `Rehabilitation`  | 0.05  | 1.0 (techo)   |
| `General/Fitness` | 0.10  | 1.5           |

---

## Resumen visual del flujo

```
GET /today/{athleteId}
        │
        ▼
¿Existe sesión hoy?
   NO y Box.IsIndividual
        │
        ▼
WodGeneratorService.GenerateForAthleteAsync(athlete, today)
        │
        ├─ Pool = Pools[athlete.Goal]
        ├─ Categorías = random 2 (ó 3 si Competition)
        ├─ Por categoría:
        │     └─ Filtrar por athlete.Equipment
        │     └─ Seleccionar ponderado por athlete.WeakPoints
        │     └─ Reps = BaseReps × RepMultiplier(athlete.Level)
        ├─ DurationMinutes = athlete.SessionDurationMinutes ó default por Level
        └─ WodType = día de la semana
        │
        ▼
AthleteWorkout creado con
ScaledRepsFactor = ScalingCalculator.InitialFactor(Level, Goal)
        │
        ▼
Tras POST /workout-results:
ScaledRepsFactor ajustado según RPE + completado
```
