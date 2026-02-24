import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Medication, DoseLog, Frequency } from '../backend';
import { DoseStatus } from '../backend';

export { DoseStatus };
export type { Medication, DoseLog, Frequency };

// ─── Medications ────────────────────────────────────────────────────────────

export function useListMedications() {
  const { actor, isFetching } = useActor();
  return useQuery<Medication[]>({
    queryKey: ['medications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllMedications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMedication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      name: string;
      dosage: string;
      frequency: Frequency;
      scheduledTimes: bigint[];
      startDate: bigint;
      endDate: bigint | null;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      await actor.addMedication(
        params.id,
        params.name,
        params.dosage,
        params.frequency,
        params.scheduledTimes,
        params.startDate,
        params.endDate,
        params.notes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });
}

export function useUpdateMedication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      name: string;
      dosage: string;
      frequency: Frequency;
      scheduledTimes: bigint[];
      startDate: bigint;
      endDate: bigint | null;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      await actor.updateMedication(
        params.id,
        params.name,
        params.dosage,
        params.frequency,
        params.scheduledTimes,
        params.startDate,
        params.endDate,
        params.notes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });
}

export function useDeleteMedication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not ready');
      await actor.deleteMedication(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['doseHistory'] });
    },
  });
}

// ─── Dose Logs ───────────────────────────────────────────────────────────────

export function useGetDoseHistory(medicationId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<DoseLog[]>({
    queryKey: ['doseHistory', medicationId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDoseHistory(medicationId);
    },
    enabled: !!actor && !isFetching && !!medicationId,
  });
}

export function useGetAllDoseHistory(medicationIds: string[]) {
  const { actor, isFetching } = useActor();
  return useQuery<Record<string, DoseLog[]>>({
    queryKey: ['doseHistory', 'all', medicationIds.join(',')],
    queryFn: async () => {
      if (!actor) return {};
      const results = await Promise.all(
        medicationIds.map(async (id) => {
          const logs = await actor.getDoseHistory(id);
          return [id, logs] as [string, DoseLog[]];
        })
      );
      return Object.fromEntries(results);
    },
    enabled: !!actor && !isFetching && medicationIds.length > 0,
  });
}

export function useLogDose() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      medicationId: string;
      scheduledTime: bigint;
      status: DoseStatus;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      await actor.logDose(params.medicationId, params.scheduledTime, params.status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doseHistory', variables.medicationId] });
      queryClient.invalidateQueries({ queryKey: ['doseHistory', 'all'] });
    },
  });
}
