"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Chip } from "@/components/ui/chip";
import { Plus, Pencil, Trash2, X, AlertTriangle } from "lucide-react";
import { useState } from "react";

const ExerciseSchema = z.object({
  name:  z.string().min(1, "Requerido"),
  reps:  z.coerce.number().int().positive("Debe ser > 0"),
  order: z.coerce.number().int().positive(),
});

const WodSchema = z.object({
  title:           z.string().min(1, "El nombre es requerido"),
  description:     z.string().optional(),
  type:            z.coerce.number().int().min(1).max(3),
  durationMinutes: z.coerce.number().int().positive("Debe ser > 0"),
  exercises:       z.array(ExerciseSchema).min(1, "Agregá al menos un ejercicio"),
});

type WodForm = z.infer<typeof WodSchema>;

const WOD_TYPES       = [{ value: 2, label: "For Time" }, { value: 1, label: "AMRAP" }, { value: 3, label: "EMOM" }];
const WOD_TYPE_LABEL: Record<string, string> = { ForTime: "For Time", Amrap: "AMRAP", Emom: "EMOM" };
const WOD_TYPE_VALUE: Record<string, number> = { ForTime: 2, Amrap: 1, Emom: 3 };

interface Wod {
  id:              number;
  title:           string;
  description?:    string;
  type:            string;
  durationMinutes: number;
  exercises:       { name: string; reps: number; order: number }[];
}

const inputClass = "w-full rounded-2xl border border-surface-border bg-surface px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30";

function WodFormFields({
  register, formState: { errors }, fields, append, remove,
}: ReturnType<typeof useForm<WodForm>> & { fields: any[]; append: any; remove: any }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Nombre</label>
        <input {...register("title")} placeholder="Fran" className={inputClass} />
        {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Descripción (opcional)</label>
        <input {...register("description")} placeholder="21-15-9 Thrusters & Pull-ups" className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Tipo</label>
          <select {...register("type")} className={`${inputClass} bg-surface`}>
            {WOD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Duración (min)</label>
          <input type="number" {...register("durationMinutes")} placeholder="15" className={inputClass} />
          {errors.durationMinutes && <p className="text-xs text-red-400">{errors.durationMinutes.message}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Ejercicios</label>
          <button
            type="button"
            onClick={() => append({ name: "", reps: 10, order: fields.length + 1 })}
            className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-light transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar
          </button>
        </div>
        {fields.map((field, i) => (
          <div key={field.id} className="flex gap-2 items-center">
            <input type="hidden" {...register(`exercises.${i}.order`)} value={i + 1} />
            <input {...register(`exercises.${i}.name`)} placeholder="Thrusters"
              className="flex-1 rounded-2xl border border-surface-border bg-surface-raised px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-brand" />
            <input type="number" {...register(`exercises.${i}.reps`)} placeholder="21"
              className="w-20 rounded-2xl border border-surface-border bg-surface-raised px-3 py-2.5 text-sm text-zinc-100 text-center outline-none focus:border-brand" />
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="text-zinc-600 hover:text-red-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WodsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [deleteId, setDeleteId]     = useState<number | null>(null);

  const { data: wods = [] } = useQuery<Wod[]>({
    queryKey: ["wods"],
    queryFn:  () => api.get<Wod[]>("/api/wods"),
  });

  const createForm = useForm<WodForm>({
    resolver: zodResolver(WodSchema),
    defaultValues: { type: 2, exercises: [{ name: "", reps: 21, order: 1 }] },
  });
  const createFields = useFieldArray({ control: createForm.control, name: "exercises" });

  const createMutation = useMutation({
    mutationFn: (data: WodForm) => api.post("/api/wods", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wods"] });
      setShowCreate(false);
      createForm.reset();
    },
  });

  const editForm = useForm<WodForm>({ resolver: zodResolver(WodSchema) });
  const editFields = useFieldArray({ control: editForm.control, name: "exercises" });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: WodForm }) => api.put(`/api/wods/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wods"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/wods/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wods"] });
      setDeleteId(null);
    },
  });

  function startEdit(wod: Wod) {
    editForm.reset({
      title:           wod.title,
      description:     wod.description ?? "",
      type:            WOD_TYPE_VALUE[wod.type] ?? 2,
      durationMinutes: wod.durationMinutes,
      exercises:       wod.exercises.sort((a, b) => a.order - b.order),
    });
    setEditingId(wod.id);
    setShowCreate(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Coach</p>
          <h1 className="text-display text-4xl text-zinc-50 mt-0.5">WODs</h1>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); setEditingId(null); }}
          className="flex items-center gap-2 rounded-2xl border border-brand/40 bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand/20 shadow-glow-sm transition-all"
        >
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreate ? "Cancelar" : "Nuevo WOD"}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form
          onSubmit={createForm.handleSubmit((d) => createMutation.mutate(d))}
          className="rounded-3xl border border-brand/25 bg-brand/5 p-5 space-y-4"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-brand">Nuevo WOD</p>
          <WodFormFields {...createForm} fields={createFields.fields} append={createFields.append} remove={createFields.remove} />
          {createMutation.isError && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">Error al crear el WOD</div>
          )}
          <PrimaryButton type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Guardando…" : "Crear WOD"}
          </PrimaryButton>
        </form>
      )}

      {/* WOD list */}
      <div className="space-y-3">
        {wods.length === 0 && (
          <div className="rounded-3xl border border-surface-border bg-surface p-10 text-center">
            <p className="text-display text-2xl text-zinc-600">SIN WODS</p>
            <p className="text-sm text-zinc-500 mt-2">No hay WODs aún. Creá el primero.</p>
          </div>
        )}

        {wods.map((wod) => (
          <div key={wod.id} className="rounded-3xl border border-surface-border bg-surface overflow-hidden">

            {editingId === wod.id ? (
              <form
                onSubmit={editForm.handleSubmit((d) => updateMutation.mutate({ id: wod.id, data: d }))}
                className="p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Editando WOD</p>
                  <button type="button" onClick={() => setEditingId(null)} className="text-zinc-500 hover:text-zinc-300">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <WodFormFields {...editForm} fields={editFields.fields} append={editFields.append} remove={editFields.remove} />
                {updateMutation.isError && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">Error al guardar</div>
                )}
                <PrimaryButton type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Guardando…" : "Guardar cambios"}
                </PrimaryButton>
              </form>
            ) : (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-zinc-100">{wod.title}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <Chip variant="default">{WOD_TYPE_LABEL[wod.type] ?? wod.type}</Chip>
                    <span className="text-[10px] text-zinc-500">{wod.durationMinutes} min</span>
                    <button
                      onClick={() => startEdit(wod)}
                      className="text-zinc-500 hover:text-brand transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(wod.id)}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {wod.exercises.sort((a, b) => a.order - b.order).map((ex, i) => (
                    <span key={i} className="rounded-full border border-surface-border bg-surface-raised px-2.5 py-0.5 text-xs text-zinc-400">
                      {ex.reps} {ex.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete confirmation modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-surface-border bg-surface p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 border border-red-500/30">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <p className="font-bold text-zinc-100">¿Eliminar este WOD?</p>
            </div>
            <p className="text-sm text-zinc-400">
              Si tiene sesiones asignadas, se marcará como eliminado pero se preservará el historial.
            </p>
            {deleteMutation.isError && <p className="text-xs text-red-400">Error al eliminar</p>}
            <div className="flex gap-3">
              <PrimaryButton variant="ghost" onClick={() => setDeleteId(null)}>Cancelar</PrimaryButton>
              <PrimaryButton
                variant="danger"
                onClick={() => deleteMutation.mutate(deleteId!)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Eliminando…" : "Eliminar"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
