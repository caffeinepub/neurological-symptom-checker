import { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { History, TrendingUp } from 'lucide-react';
import { useListMedications, useGetAllDoseHistory } from '../hooks/useQueries';
import { AdherenceSummary } from '../components/AdherenceSummary';
import { DoseStatus } from '../backend';
import type { DoseLog } from '../backend';
import { nsToDateTimeString, nsToDateString } from '../lib/utils';
import { cn } from '../lib/utils';

const statusConfig = {
  [DoseStatus.taken]: { label: 'Taken', className: 'status-taken' },
  [DoseStatus.skipped]: { label: 'Skipped', className: 'status-skipped' },
  [DoseStatus.missed]: { label: 'Missed', className: 'status-missed' },
};

export function HistoryPage() {
  const { data: medications, isLoading: medsLoading } = useListMedications();
  const medicationIds = useMemo(() => medications?.map((m) => m.id) ?? [], [medications]);
  const { data: allHistory, isLoading: historyLoading } = useGetAllDoseHistory(medicationIds);
  const [selectedMedId, setSelectedMedId] = useState<string>('all');

  const isLoading = medsLoading || (medicationIds.length > 0 && historyLoading);

  // Flatten all logs with medication name
  const allLogs = useMemo(() => {
    if (!medications || !allHistory) return [];
    const logs: (DoseLog & { medicationName: string; medicationDosage: string })[] = [];
    for (const med of medications) {
      const medLogs = allHistory[med.id] ?? [];
      for (const log of medLogs) {
        logs.push({ ...log, medicationName: med.name, medicationDosage: med.dosage });
      }
    }
    return logs.sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [medications, allHistory]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    if (selectedMedId === 'all') return allLogs;
    return allLogs.filter((l) => l.medicationId === selectedMedId);
  }, [allLogs, selectedMedId]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof filteredLogs> = {};
    for (const log of filteredLogs) {
      const dateKey = nsToDateString(log.timestamp);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    }
    return groups;
  }, [filteredLogs]);

  const dateKeys = Object.keys(groupedByDate);

  return (
    <div className="space-y-6 pb-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-serif font-semibold text-foreground">History & Adherence</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your medication adherence over time
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : !medications || medications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <History className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="font-serif font-medium text-foreground mb-1">No history yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Add medications and start logging doses to see your history here.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="adherence">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="adherence" className="gap-2 flex-1 sm:flex-none">
              <TrendingUp className="h-4 w-4" />
              Adherence
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 flex-1 sm:flex-none">
              <History className="h-4 w-4" />
              Log
            </TabsTrigger>
          </TabsList>

          {/* Adherence Tab */}
          <TabsContent value="adherence" className="mt-4 space-y-3">
            {medications.map((med) => (
              <AdherenceSummary
                key={med.id}
                medication={med}
                doseLogs={allHistory?.[med.id] ?? []}
              />
            ))}
          </TabsContent>

          {/* History Log Tab */}
          <TabsContent value="history" className="mt-4 space-y-4">
            {/* Filter by medication */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">Filter:</span>
              <button
                onClick={() => setSelectedMedId('all')}
                className={cn(
                  'text-xs px-3 py-1 rounded-full border transition-colors',
                  selectedMedId === 'all'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                )}
              >
                All
              </button>
              {medications.map((med) => (
                <button
                  key={med.id}
                  onClick={() => setSelectedMedId(med.id)}
                  className={cn(
                    'text-xs px-3 py-1 rounded-full border transition-colors',
                    selectedMedId === med.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                  )}
                >
                  {med.name}
                </button>
              ))}
            </div>

            {filteredLogs.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No dose logs found.
              </div>
            ) : (
              <div className="space-y-4">
                {dateKeys.map((dateKey) => (
                  <Card key={dateKey} className="shadow-soft border-border">
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {dateKey}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3 px-4">
                      <div className="space-y-0">
                        {groupedByDate[dateKey].map((log, idx) => (
                          <div key={idx}>
                            {idx > 0 && <Separator className="my-2" />}
                            <div className="flex items-center justify-between py-1">
                              <div>
                                <p className="text-sm font-medium">{log.medicationName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {log.medicationDosage} · {nsToDateTimeString(log.scheduledTime)}
                                </p>
                              </div>
                              <Badge
                                className={cn(
                                  'text-xs border-0',
                                  statusConfig[log.status].className
                                )}
                              >
                                {statusConfig[log.status].label}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
