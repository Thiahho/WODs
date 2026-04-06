
---

## 1. 🧑‍💻 Onboarding del atleta
- Crear `athlete`
- Guardar:
  - nivel
  - objetivo
  - peso inicial
- (opcional) `performance_metrics`

---

## 2. 📅 Input diario (estado del atleta)
- Usuario carga:
  - energía (`energy_level`)
  - fatiga (`fatigue_level`)
  - sueño (`sleep_hours`)
  - notas (audio → texto)

👉 Se guarda en:
- `athlete_daily_logs`

---

## 3. 🧠 Cálculo del estado (backend)
- Leer:
  - `daily_logs`
  - `workout_results`
  - `performance_metrics`

- Calcular:
  - fatiga
  - recuperación
  - carga aguda (7 días)
  - carga crónica (28 días)
  - ratio de carga
  - tendencia de rendimiento

👉 Se guarda en:
- `athlete_status`

---

## 4. 🤖 Decisión IA
- Input:
  - `athlete`
  - `athlete_status`
  - resultados recientes
  - WODs recientes

- Decide:
  - intensidad (alta / media / deload)
  - tipo de entrenamiento
  - foco (fuerza, resistencia, etc.)

---

## 5. 🏋️ Generación del WOD
- Warm-up
- Strength / Skill
- Metcon (AMRAP / EMOM / FOR TIME)
- Escalado

👉 Se guarda en:
- `wods`
- `workout_sessions`
- `athlete_workouts`

---

## 6. 💪 Ejecución
- El atleta realiza el entrenamiento

---

## 7. 📊 Registro de resultados
- Usuario carga:
  - tiempo (`time_seconds`)
  - rounds / reps
  - RPE
  - notas

👉 Se guarda en:
- `workout_results`

---

## 8. 📈 Análisis automático
- Detecta:
  - progreso
  - estancamiento
  - fatiga acumulada
  - riesgo de lesión

---

## 9. 🔁 Loop continuo
- El sistema repite el flujo diariamente
- Se adapta al atleta en base a datos reales

---

## ⚠️ Puntos críticos

- Sin `daily_logs` → menor precisión IA  
- Sin `workout_results` → no hay progreso  
- Sin `athlete_status` → IA genérica  

---

## 🧠 Concepto clave

> No es un generador de WODs  
> Es un sistema de mejora continua basado en datos