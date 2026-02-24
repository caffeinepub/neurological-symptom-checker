import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Clock, Calendar, FileText } from 'lucide-react';
import type { Medication } from '../backend';
import { formatFrequency, nsToTimeString, nsToDateString } from '../lib/utils';

interface MedicationCardProps {
  medication: Medication;
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function MedicationCard({ medication, onEdit, onDelete, isDeleting }: MedicationCardProps) {
  return (
    <Card className="shadow-soft hover:shadow-card transition-shadow duration-200 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold font-serif truncate">
              {medication.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">{medication.dosage}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(medication)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(medication.id)}
              disabled={isDeleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Frequency badge */}
        <Badge variant="secondary" className="text-xs font-medium">
          {formatFrequency(medication.frequency)}
        </Badge>

        {/* Scheduled times */}
        {medication.scheduledTimes.length > 0 && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{medication.scheduledTimes.map(nsToTimeString).join(', ')}</span>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            {nsToDateString(medication.startDate)}
            {medication.endDate ? ` → ${nsToDateString(medication.endDate)}` : ' (ongoing)'}
          </span>
        </div>

        {/* Notes */}
        {medication.notes && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{medication.notes}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
