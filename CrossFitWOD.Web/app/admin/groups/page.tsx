"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { PrimaryButton } from "@/components/ui/primary-button";
import { cn } from "@/lib/cn";
import { UsersRound, Plus, X, Pencil, Trash2, ChevronDown, ChevronUp, UserMinus, UserPlus } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AthleteInGroup { id: number; name: string; level: string }
interface Group {
  id: number; name: string; description: string | null;
  createdAt: string; athletes: AthleteInGroup[];
}
interface AthleteListItem { id: number; name: string; level: string; groups: { id: number; name: string }[] }

const LEVEL_LABEL: Record<string, string> = {
  Beginner: "Principiante", Intermediate: "Intermedio", Advanced: "Avanzado",
};

const inputClass  = "w-full rounded-2xl border border-surface-border bg-surface px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand/30";
const labelClass  = "text-[10px] font-semibold uppercase tracking-widest text-zinc-500";

// ── Modal crear / editar grupo ────────────────────────────────────────────────

interface GroupModalProps {
  allAthletes: AthleteListItem[];
  athleteGroupMap: Map<number, string[]>;
  group?: Group;
  onClose: () => void;
}

function GroupModal({ allAthletes, athleteGroupMap, group, onClose }: GroupModalProps) {
  const queryClient = useQueryClient();
  const isEdit      = !!group;

  const [name,        setName]        = useState(group?.name ?? "");
  const [description, setDescription] = useState(group?.description ?? "");
  const [selected,    setSelected]    = useState<Set<number>>(
    new Set(group?.athletes.map(a => a.id) ?? [])
  );
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        await api.put(`/api/groups/${group.id}`, { name, description: description || null });

        // Sync athletes: add new, remove removed
        const current = new Set(group.athletes.map(a => a.id));
        const toAdd    = [...selected].filter(id => !current.has(id));
        const toRemove = [...current].filter(id => !selected.has(id));
        await Promise.all([
          ...toAdd.map(id    => api.post(`/api/groups/${group.id}/athletes/${id}`, {})),
          ...toRemove.map(id => api.delete(`/api/groups/${group.id}/athletes/${id}`)),
        ]);
      } else {
        await api.post("/api/groups", {
          name,
          description: description || null,
          athleteIds: [...selected],
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      onClose();
    },
    onError: (err: unknown) => {
      setError(err instanceof ApiError ? err.message : "Error al guardar");
    },
  });

  function toggleAthlete(id: number) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-3xl border border-surface-border bg-surface p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-display text-2xl text-zinc-50">
            {isEdit ? "Editar grupo" : "Nuevo grupo"}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Nombre del grupo</label>
            <input
              className={inputClass}
              placeholder="ej: Equipo Competencia"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Descripción <span className="normal-case font-normal text-zinc-600">(opcional)</span></label>
            <input
              className={inputClass}
              placeholder="ej: Lunes y miércoles 7pm"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {allAthletes.length > 0 && (
            <div className="space-y-2">
              <label className={labelClass}>Atletas ({selected.size} seleccionados)</label>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {allAthletes.map(a => {
                  const on = selected.has(a.id);
                  // grupos a los que pertenece, excluyendo el grupo que se está editando
                  const memberOf = (athleteGroupMap.get(a.id) ?? [])
                    .filter(gName => gName !== group?.name);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAthlete(a.id)}
                      className={cn(
                        "w-full flex items-center justify-between rounded-2xl border px-3 py-2.5 text-left transition-all",
                        on
                          ? "border-brand bg-brand/10"
                          : "border-surface-border bg-surface-raised hover:border-zinc-600"
                      )}
                    >
                      <div className="min-w-0">
                        <p className={cn("text-sm font-medium", on ? "text-brand" : "text-zinc-300")}>
                          {a.name}
                        </p>
                        {memberOf.length > 0 && (
                          <p className="text-[10px] text-zinc-500 mt-0.5 truncate">
                            En: {memberOf.join(", ")}
                          </p>
                        )}
                      </div>
                      <span className={cn("text-[10px] shrink-0 ml-2", on ? "text-brand/70" : "text-zinc-600")}>
                        {LEVEL_LABEL[a.level] ?? a.level}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <PrimaryButton type="button" variant="ghost" onClick={onClose}>Cancelar</PrimaryButton>
          <PrimaryButton
            type="button"
            disabled={!name.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear grupo"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function GroupsPage() {
  const queryClient = useQueryClient();
  const [expanded,   setExpanded]   = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing,    setEditing]    = useState<Group | null>(null);

  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn:  () => api.get<Group[]>("/api/groups"),
  });

  const { data: allAthletes = [] } = useQuery<AthleteListItem[]>({
    queryKey: ["athletes"],
    queryFn:  () => api.get<AthleteListItem[]>("/api/athletes"),
    refetchOnMount: "always",
  });

  // athleteId → nombres de grupos (fuente: allAthletes, más fresco que groups)
  const athleteGroupMap = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const a of allAthletes) {
      if (a.groups?.length) map.set(a.id, a.groups.map(g => g.name));
    }
    return map;
  }, [allAthletes]);

  const deleteGroup = useMutation({
    mutationFn: (id: number) => api.delete(`/api/groups/${id}`),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  });

  const removeAthlete = useMutation({
    mutationFn: ({ groupId, athleteId }: { groupId: number; athleteId: number }) =>
      api.delete(`/api/groups/${groupId}/athletes/${athleteId}`),
    onSuccess: () => Promise.all([
      queryClient.refetchQueries({ queryKey: ["groups"] }),
      queryClient.refetchQueries({ queryKey: ["athletes"] }),
    ]),
  });

  const addAthlete = useMutation({
    mutationFn: ({ groupId, athleteId }: { groupId: number; athleteId: number }) =>
      api.post(`/api/groups/${groupId}/athletes/${athleteId}`, {}),
    onSuccess: () => Promise.all([
      queryClient.refetchQueries({ queryKey: ["groups"] }),
      queryClient.refetchQueries({ queryKey: ["athletes"] }),
    ]),
  });

  return (
    <div className="space-y-6">
      {(showCreate || editing) && (
        <GroupModal
          allAthletes={allAthletes}
          athleteGroupMap={athleteGroupMap}
          group={editing ?? undefined}
          onClose={() => { setShowCreate(false); setEditing(null); }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Coach</p>
          <h1 className="text-display text-4xl text-zinc-50 mt-0.5">Grupos</h1>
          <p className="text-xs text-zinc-500 mt-1">{groups.length} grupos creados</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-2xl border border-brand/40 bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand/20 shadow-glow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          Nuevo grupo
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-3xl border border-surface-border bg-surface" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && groups.length === 0 && (
        <div className="rounded-3xl border border-surface-border bg-surface p-12 text-center space-y-3">
          <UsersRound className="mx-auto h-10 w-10 text-zinc-700" />
          <p className="text-display text-2xl text-zinc-600">SIN GRUPOS</p>
          <p className="text-sm text-zinc-500">Creá grupos para organizar tus atletas.</p>
          <PrimaryButton variant="outline" size="sm" onClick={() => setShowCreate(true)}>
            Crear primer grupo
          </PrimaryButton>
        </div>
      )}

      {/* Groups list */}
      <div className="space-y-3">
        {groups.map(group => {
          const isOpen = expanded === group.id;
          const notInGroup = allAthletes.filter(a => !group.athletes.some(ga => ga.id === a.id));

          return (
            <div key={group.id} className="rounded-3xl border border-surface-border bg-surface overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-4">
                <button
                  onClick={() => setExpanded(isOpen ? null : group.id)}
                  className="flex flex-1 items-center gap-3 min-w-0 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand/10 border border-brand/20">
                    <UsersRound className="h-5 w-5 text-brand" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-zinc-100">{group.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {group.description
                        ? group.description
                        : `${group.athletes.length} atleta${group.athletes.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-display text-2xl text-brand">{group.athletes.length}</span>
                    {isOpen
                      ? <ChevronUp className="h-4 w-4 text-zinc-500" />
                      : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                  </div>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditing(group)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 hover:bg-surface-raised hover:text-zinc-300 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteGroup.mutate(group.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Expanded */}
              {isOpen && (
                <div className="border-t border-surface-border px-4 pb-4 space-y-3 pt-3">

                  {/* Athletes in group */}
                  {group.athletes.length === 0 && (
                    <p className="text-xs text-zinc-500 py-1">Sin atletas en este grupo.</p>
                  )}
                  {group.athletes.map(a => (
                    <div key={a.id} className="flex items-center justify-between rounded-2xl border border-surface-border bg-surface-raised px-3 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{a.name}</p>
                        <p className="text-[10px] text-zinc-600">{LEVEL_LABEL[a.level] ?? a.level}</p>
                      </div>
                      <button
                        onClick={() => removeAthlete.mutate({ groupId: group.id, athleteId: a.id })}
                        className="flex items-center gap-1 rounded-xl border border-red-500/20 px-2 py-1 text-[10px] font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <UserMinus className="h-3 w-3" />
                        Quitar
                      </button>
                    </div>
                  ))}

                  {/* Add athletes not in group */}
                  {notInGroup.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Agregar al grupo</p>
                      {notInGroup.map(a => {
                        const otherGroups = (athleteGroupMap.get(a.id) ?? [])
                          .filter(gName => gName !== group.name);
                        return (
                          <div key={a.id} className="flex items-center justify-between rounded-2xl border border-surface-border bg-surface px-3 py-2.5">
                            <div className="min-w-0">
                              <p className="text-sm text-zinc-300">{a.name}</p>
                              {otherGroups.length > 0 ? (
                                <p className="text-[10px] text-zinc-500 mt-0.5 truncate">
                                  En: {otherGroups.join(", ")}
                                </p>
                              ) : (
                                <p className="text-[10px] text-zinc-600">{LEVEL_LABEL[a.level] ?? a.level}</p>
                              )}
                            </div>
                            <button
                              onClick={() => addAthlete.mutate({ groupId: group.id, athleteId: a.id })}
                              className="flex items-center gap-1 rounded-xl border border-brand/30 px-2 py-1 text-[10px] font-semibold text-brand hover:bg-brand/10 transition-colors shrink-0 ml-2"
                            >
                              <UserPlus className="h-3 w-3" />
                              Agregar
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
