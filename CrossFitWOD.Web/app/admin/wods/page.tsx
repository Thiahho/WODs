"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
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

function WodFormFields({
  register, formState: { errors }, fields, append, remove, control,
}: ReturnType<typeof useForm<WodForm>> & { fields: any[]; append: any; remove: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-medium text-zinc-400">Nombre</label>
          <input {...register("title")} placeholder="Fran"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
        </div>
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-medium text-zinc-400">Descripción (opcional)</label>
          <input {...register("description")} placeholder="21-15-9 Thrusters & Pull-ups"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-400">Tipo</label>
          <select {...register("type")}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500">
            {WOD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-400">Duración (min)</label>
          <input type="number" {...register("durationMinutes")} placeholder="15"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          {errors.durationMinutes && <p className="text-xs text-red-400">{errors.durationMinutes.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-400">Ejercicios</label>
          <button type="button" onClick={() => append({ name: "", reps: 10, order: fields.length + 1 })}
            className="text-xs text-orange-400 hover:underline">+ Agregar</button>
        </div>
        {fields.map((field, i) => (
          <div key={field.id} className="flex gap-2 items-start">
            <input type="hidden" {...register(`exercises.${i}.order`)} value={i + 1} />
            <input {...register(`exercises.${i}.name`)} placeholder="Thrusters"
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            <input type="number" {...register(`exercises.${i}.reps`)} placeholder="21"
              className="w-20 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="py-2 text-xs text-zinc-500 hover:text-red-400">✕</button>
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

  // ── Crear ─────────────────────────────────────────────────────────────────
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

  // ── Editar ─────────────────────────────────────────────────────────────────
  const editForm = useForm<WodForm>({ resolver: zodResolver(WodSchema) });
  const editFields = useFieldArray({ control: editForm.control, name: "exercises" });

  const updateMutationReal = useMutation({
    mutationFn: ({ id, data }: { id: number; data: WodForm }) =>
      api.put(`/api/wods/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wods"] });
      setEditingId(null);
    },
  });

  // ── Eliminar ───────────────────────────────────────────────────────────────
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">WODs</h1>
        <button
          onClick={() => { setShowCreate(!showCreate); setEditingId(null); }}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          {showCreate ? "Cancelar" : "+ Nuevo WOD"}
        </button>
      </div>

      {/* Formulario creación */}
      {showCreate && (
        <form onSubmit={createForm.handleSubmit((d) => createMutation.mutate(d))}
          className="rounded-2xl border border-zinc-700 bg-zinc-900 p-5 space-y-4">
          <p className="text-sm font-semibold text-zinc-300">Nuevo WOD</p>
          <WodFormFields {...createForm} fields={createFields.fields} append={createFields.append} remove={createFields.remove} />
          {createMutation.isError && <p className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-300">Error al crear el WOD</p>}
          <button type="submit" disabled={createMutation.isPending}
            className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50">
            {createMutation.isPending ? "Guardando…" : "Crear WOD"}
          </button>
        </form>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {wods.length === 0 && <p className="text-center text-sm text-zinc-500 py-8">No hay WODs aún. Creá el primero.</p>}

        {wods.map((wod) => (
          <div key={wod.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">

            {editingId === wod.id ? (
              /* Formulario edición inline */
              <form onSubmit={editForm.handleSubmit((d) => updateMutationReal.mutate({ id: wod.id, data: d }))}
                className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-300">Editando WOD</p>
                  <button type="button" onClick={() => setEditingId(null)} className="text-xs text-zinc-500 hover:text-zinc-300">Cancelar</button>
                </div>
                <WodFormFields {...editForm} fields={editFields.fields} append={editFields.append} remove={editFields.remove} />
                {updateMutationReal.isError && <p className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-300">Error al guardar</p>}
                <button type="submit" disabled={updateMutationReal.isPending}
                  className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50">
                  {updateMutationReal.isPending ? "Guardando…" : "Guardar cambios"}
                </button>
              </form>
            ) : (
              /* Vista normal */
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-zinc-100">{wod.title}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">
                      {WOD_TYPE_LABEL[wod.type] ?? wod.type} · {wod.durationMinutes} min
                    </span>
                    <button onClick={() => startEdit(wod)}
                      className="text-xs text-zinc-400 hover:text-orange-400 transition-colors">
                      Editar
                    </button>
                    <button onClick={() => setDeleteId(wod.id)}
                      className="text-xs text-zinc-400 hover:text-red-400 transition-colors">
                      Eliminar
                    </button>
                  </div>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {wod.exercises.sort((a, b) => a.order - b.order).map((ex, i) => (
                    <li key={i} className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300">
                      {ex.reps} {ex.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal confirmación eliminación */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-6 space-y-4">
            <p className="font-semibold text-zinc-100">¿Eliminar este WOD?</p>
            <p className="text-sm text-zinc-400">
              Si tiene sesiones asignadas, se marcará como eliminado pero se preservará el historial.
            </p>
            {deleteMutation.isError && <p className="text-xs text-red-400">Error al eliminar</p>}
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId!)}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {deleteMutation.isPending ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
