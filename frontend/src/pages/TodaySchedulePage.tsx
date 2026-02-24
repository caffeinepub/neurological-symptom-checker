import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Sparkles } from 'lucide-react';
import { useListMedications, useGetAllDoseHistory } from '../hooks/useQueries';
import { DoseEntry } from '../components/DoseEntry';
import type { Medication, DoseLog } from '../backend';
import { nsToHHMM, getTodayRange } from '../lib/utils';

interface ScheduledDose {
  medication: Medication;
  scheduledTime: bigint;
  existingLog?: DoseLog;
  sortKey: string;
}

export function TodaySchedulePage() {
  const { data: medications, isLoading: medsLoading } = useListMedications();
  const medicationIds = useMemo(() => medications?.map((m) => m.id) ?? [], [medications]);
  const { data: allHistory, isLoading: historyLoading } = useGetAllDoseHistory(medicationIds);

  const todayDoses = useMemo<ScheduledDose[]>(() => {
    if (!medications) return [];
    const { start, end } = getTodayRange();
    const doses: ScheduledDose[] = [];

    for (const med of medications) {
      // Check if medication is active today
      if (med.endDate && med.endDate < start) continue;
      if (med.startDate > end) continue;

      for (const scheduledTime of med.scheduledTimes) {
        // scheduledTime is stored as time-of-day from epoch (2000-01-01)
        // Extract HH:MM and map to today
        const hhmm = nsToHHMM(scheduledTime);
        const [h, m] = hhmm.split(':').map(Number);
        const todayDate = new Date();
        todayDate.setHours(h, m, 0, 0);
        const todayNs = BigInt(todayDate.getTime()) * 1_000_000n;

        // Find existing log for this dose today
        const logs = allHistory?.[med.id] ?? [];
        const existingLog = logs.find((log) => {
          const logHHMM = nsToHHMM(log.scheduledTime);
          return logHHMM === hhmm;
        });

        doses.push({
          medication: med,
          scheduledTime: todayNs,
          existingLog,
          sortKey: hhmm,
        });
      }
    }

    return doses.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [medications, allHistory]);

  const isLoading = medsLoading || (medicationIds.length > 0 && historyLoading);

  const today = new Date().toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const takenCount = todayDoses.filter((d) => d.existingLog?.status === 'taken').length;
  const totalCount = todayDoses.length;

  return (
    <div className="space-y-6 pb-4">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Today's Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">{today}</p>
        </div>
        {totalCount > 0 && (
          <div className="text-right">
            <p className="text-2xl font-bold text-primary tabular-nums">
              {takenCount}/{totalCount}
            </p>
            <p className="text-xs text-muted-foreground">doses taken</p>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : todayDoses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {medications && medications.length === 0 ? (
            <>
              <CalendarDays className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="font-serif font-medium text-foreground mb-1">No medications yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Add your first medication in the Medications tab to start tracking your doses.
              </p>
            </>
          ) : (
            <>
              <Sparkles className="h-12 w-12 text-primary/40 mb-4" />
              <h3 className="font-serif font-medium text-foreground mb-1">All clear today!</h3>
              <p className="text-sm text-muted-foreground">No doses scheduled for today.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {todayDoses.map((dose, idx) => (
            <DoseEntry
              key={`${dose.medication.id}-${idx}`}
              medication={dose.medication}
              scheduledTime={dose.scheduledTime}
              existingLog={dose.existingLog}
            />
          ))}
        </div>
      )}
    </div>
  );
}
