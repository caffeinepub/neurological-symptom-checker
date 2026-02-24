import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import type { Medication, Frequency } from '../backend';
import { generateId, dateToNs, nsToHHMM } from '../lib/utils';

interface MedicationFormProps {
  mode: 'add' | 'edit';
  initialData?: Medication;
  onSubmit: (data: {
    id: string;
    name: string;
    dosage: string;
    frequency: Frequency;
    scheduledTimes: bigint[];
    startDate: bigint;
    endDate: bigint | null;
    notes: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

type FrequencyKind = 'daily' | 'twiceDaily' | 'weekly' | 'custom';

function frequencyToKind(freq: Frequency): FrequencyKind {
  return freq.__kind__ as FrequencyKind;
}

function kindToFrequency(kind: FrequencyKind, customDays?: number): Frequency {
  if (kind === 'daily') return { __kind__: 'daily', daily: null };
  if (kind === 'twiceDaily') return { __kind__: 'twiceDaily', twiceDaily: null };
  if (kind === 'weekly') return { __kind__: 'weekly', weekly: null };
  return { __kind__: 'custom', custom: BigInt(customDays ?? 2) };
}

export function MedicationForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: MedicationFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [dosage, setDosage] = useState(initialData?.dosage ?? '');
  const [frequencyKind, setFrequencyKind] = useState<FrequencyKind>(
    initialData ? frequencyToKind(initialData.frequency) : 'daily'
  );
  const [customDays, setCustomDays] = useState(
    initialData?.frequency.__kind__ === 'custom'
      ? Number((initialData.frequency as { __kind__: 'custom'; custom: bigint }).custom)
      : 2
  );
  const [times, setTimes] = useState<string[]>(
    initialData?.scheduledTimes.length
      ? initialData.scheduledTimes.map(nsToHHMM)
      : ['08:00']
  );
  const [startDate, setStartDate] = useState(
    initialData
      ? new Date(Number(initialData.startDate / 1_000_000n)).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate
      ? new Date(Number(initialData.endDate / 1_000_000n)).toISOString().split('T')[0]
      : ''
  );
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addTime = () => setTimes((prev) => [...prev, '12:00']);
  const removeTime = (idx: number) => setTimes((prev) => prev.filter((_, i) => i !== idx));
  const updateTime = (idx: number, val: string) =>
    setTimes((prev) => prev.map((t, i) => (i === idx ? val : t)));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Medication name is required';
    if (!dosage.trim()) errs.dosage = 'Dosage is required';
    if (times.length === 0) errs.times = 'At least one scheduled time is required';
    if (!startDate) errs.startDate = 'Start date is required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    // Convert times to today's nanosecond timestamps (time-of-day only)
    const scheduledTimes = times.map((t) => {
      const [h, m] = t.split(':').map(Number);
      const d = new Date(2000, 0, 1, h, m, 0, 0);
      return dateToNs(d);
    });

    const startDateNs = dateToNs(new Date(startDate + 'T00:00:00'));
    const endDateNs = endDate ? dateToNs(new Date(endDate + 'T23:59:59')) : null;

    await onSubmit({
      id: initialData?.id ?? generateId(),
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: kindToFrequency(frequencyKind, customDays),
      scheduledTimes,
      startDate: startDateNs,
      endDate: endDateNs,
      notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="med-name">Medication Name *</Label>
        <Input
          id="med-name"
          placeholder="e.g. Metformin"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Dosage */}
      <div className="space-y-1.5">
        <Label htmlFor="med-dosage">Dosage *</Label>
        <Input
          id="med-dosage"
          placeholder="e.g. 500mg"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          className={errors.dosage ? 'border-destructive' : ''}
        />
        {errors.dosage && <p className="text-xs text-destructive">{errors.dosage}</p>}
      </div>

      {/* Frequency */}
      <div className="space-y-1.5">
        <Label>Frequency *</Label>
        <Select value={frequencyKind} onValueChange={(v) => setFrequencyKind(v as FrequencyKind)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="twiceDaily">Twice Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        {frequencyKind === 'custom' && (
          <div className="flex items-center gap-2 mt-2">
            <Label htmlFor="custom-days" className="text-sm text-muted-foreground whitespace-nowrap">
              Every
            </Label>
            <Input
              id="custom-days"
              type="number"
              min={1}
              max={365}
              value={customDays}
              onChange={(e) => setCustomDays(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">days</span>
          </div>
        )}
      </div>

      {/* Scheduled Times */}
      <div className="space-y-1.5">
        <Label>Scheduled Times *</Label>
        <div className="space-y-2">
          {times.map((t, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                type="time"
                value={t}
                onChange={(e) => updateTime(idx, e.target.value)}
                className="w-36"
              />
              {times.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTime(idx)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTime}
            className="gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Time
          </Button>
        </div>
        {errors.times && <p className="text-xs text-destructive">{errors.times}</p>}
      </div>

      {/* Start Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="start-date">Start Date *</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={errors.startDate ? 'border-destructive' : ''}
          />
          {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end-date">End Date (optional)</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any special instructions..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {mode === 'add' ? 'Add Medication' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
