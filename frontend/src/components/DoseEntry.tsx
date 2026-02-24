import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, SkipForward, AlertCircle, Loader2 } from 'lucide-react';
import { DoseStatus } from '../backend';
import type { DoseLog, Medication } from '../backend';
import { nsToTimeString } from '../lib/utils';
import { useLogDose } from '../hooks/useQueries';
import { cn } from '../lib/utils';

interface DoseEntryProps {
  medication: Medication;
  scheduledTime: bigint;
  existingLog?: DoseLog;
}

const statusConfig = {
  [DoseStatus.taken]: {
    label: 'Taken',
    className: 'status-taken',
    icon: Check,
  },
  [DoseStatus.skipped]: {
    label: 'Skipped',
    className: 'status-skipped',
    icon: SkipForward,
  },
  [DoseStatus.missed]: {
    label: 'Missed',
    className: 'status-missed',
    icon: AlertCircle,
  },
};

export function DoseEntry({ medication, scheduledTime, existingLog }: DoseEntryProps) {
  const logDose = useLogDose();
  const [optimisticStatus, setOptimisticStatus] = useState<DoseStatus | null>(
    existingLog?.status ?? null
  );
  const [loadingStatus, setLoadingStatus] = useState<DoseStatus | null>(null);

  const currentStatus = optimisticStatus;

  const handleLog = async (status: DoseStatus) => {
    setLoadingStatus(status);
    setOptimisticStatus(status);
    try {
      await logDose.mutateAsync({
        medicationId: medication.id,
        scheduledTime,
        status,
      });
    } catch {
      setOptimisticStatus(existingLog?.status ?? null);
    } finally {
      setLoadingStatus(null);
    }
  };

  const timeStr = nsToTimeString(scheduledTime);

  return (
    <Card className="shadow-xs border-border">
      <CardContent className="py-4 px-4">
        <div className="flex items-center justify-between gap-3">
          {/* Left: time + med info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-center shrink-0">
              <p className="text-sm font-semibold text-primary tabular-nums">{timeStr}</p>
            </div>
            <div className="w-px h-8 bg-border shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{medication.name}</p>
              <p className="text-xs text-muted-foreground">{medication.dosage}</p>
            </div>
          </div>

          {/* Right: status or action buttons */}
          <div className="shrink-0">
            {currentStatus ? (
              <div className="flex items-center gap-1.5">
                <Badge
                  className={cn(
                    'text-xs font-medium border-0 gap-1',
                    statusConfig[currentStatus].className
                  )}
                >
                  {(() => {
                    const Icon = statusConfig[currentStatus].icon;
                    return <Icon className="h-3 w-3" />;
                  })()}
                  {statusConfig[currentStatus].label}
                </Badge>
                {/* Allow re-logging */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground px-2"
                  onClick={() => setOptimisticStatus(null)}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {([DoseStatus.taken, DoseStatus.skipped, DoseStatus.missed] as DoseStatus[]).map(
                  (status) => {
                    const config = statusConfig[status];
                    const Icon = config.icon;
                    const isLoading = loadingStatus === status;
                    return (
                      <Button
                        key={status}
                        variant="outline"
                        size="sm"
                        className={cn(
                          'h-8 text-xs gap-1 px-2.5',
                          status === DoseStatus.taken &&
                            'hover:bg-[oklch(var(--taken-bg))] hover:text-[oklch(var(--taken))] hover:border-[oklch(var(--taken))]',
                          status === DoseStatus.skipped &&
                            'hover:bg-[oklch(var(--skipped-bg))] hover:text-[oklch(var(--skipped))] hover:border-[oklch(var(--skipped))]',
                          status === DoseStatus.missed &&
                            'hover:bg-[oklch(var(--missed-bg))] hover:text-[oklch(var(--missed))] hover:border-[oklch(var(--missed))]'
                        )}
                        onClick={() => handleLog(status)}
                        disabled={loadingStatus !== null}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Icon className="h-3 w-3" />
                        )}
                        {config.label}
                      </Button>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
