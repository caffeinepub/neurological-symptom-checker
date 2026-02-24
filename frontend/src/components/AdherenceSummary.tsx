import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Medication, DoseLog } from '../backend';
import { DoseStatus } from '../backend';
import { formatFrequency } from '../lib/utils';

interface AdherenceSummaryProps {
  medication: Medication;
  doseLogs: DoseLog[];
}

export function AdherenceSummary({ medication, doseLogs }: AdherenceSummaryProps) {
  const total = doseLogs.length;
  const taken = doseLogs.filter((l) => l.status === DoseStatus.taken).length;
  const skipped = doseLogs.filter((l) => l.status === DoseStatus.skipped).length;
  const missed = doseLogs.filter((l) => l.status === DoseStatus.missed).length;
  const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

  const getAdherenceColor = (pct: number) => {
    if (pct >= 80) return 'text-[oklch(var(--taken))]';
    if (pct >= 50) return 'text-[oklch(var(--skipped))]';
    return 'text-[oklch(var(--missed))]';
  };

  return (
    <Card className="shadow-soft border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold font-serif">{medication.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {medication.dosage} · {formatFrequency(medication.frequency)}
            </p>
          </div>
          <span className={`text-2xl font-bold tabular-nums ${getAdherenceColor(adherence)}`}>
            {adherence}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={adherence} className="h-2" />
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="status-taken border-0 text-xs gap-1">
            ✓ {taken} taken
          </Badge>
          <Badge className="status-skipped border-0 text-xs gap-1">
            → {skipped} skipped
          </Badge>
          <Badge className="status-missed border-0 text-xs gap-1">
            ✗ {missed} missed
          </Badge>
          {total === 0 && (
            <span className="text-xs text-muted-foreground">No doses logged yet</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
