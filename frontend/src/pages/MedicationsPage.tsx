import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pill } from 'lucide-react';
import { useListMedications, useAddMedication, useUpdateMedication, useDeleteMedication } from '../hooks/useQueries';
import { MedicationCard } from '../components/MedicationCard';
import { MedicationForm } from '../components/MedicationForm';
import type { Medication, Frequency } from '../backend';
import { toast } from 'sonner';

export function MedicationsPage() {
  const { data: medications, isLoading } = useListMedications();
  const addMutation = useAddMedication();
  const updateMutation = useUpdateMedication();
  const deleteMutation = useDeleteMedication();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingMed(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (med: Medication) => {
    setEditingMed(med);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: {
    id: string;
    name: string;
    dosage: string;
    frequency: Frequency;
    scheduledTimes: bigint[];
    startDate: bigint;
    endDate: bigint | null;
    notes: string;
  }) => {
    try {
      if (editingMed) {
        await updateMutation.mutateAsync(data);
        toast.success('Medication updated successfully');
      } else {
        await addMutation.mutateAsync(data);
        toast.success('Medication added successfully');
      }
      setDialogOpen(false);
      setEditingMed(null);
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      toast.success('Medication removed');
    } catch {
      toast.error('Failed to delete medication');
    } finally {
      setDeleteTarget(null);
    }
  };

  const isMutating = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 pb-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Medications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {medications ? `${medications.length} medication${medications.length !== 1 ? 's' : ''}` : 'Manage your medications'}
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 shadow-soft">
          <Plus className="h-4 w-4" />
          Add Medication
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : medications && medications.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {medications.map((med) => (
            <MedicationCard
              key={med.id}
              medication={med}
              onEdit={handleOpenEdit}
              onDelete={(id) => setDeleteTarget(id)}
              isDeleting={deleteMutation.isPending && deleteTarget === med.id}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Pill className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-serif font-medium text-foreground mb-1">No medications yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            Add your first medication to start tracking your daily doses.
          </p>
          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Medication
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingMed ? 'Edit Medication' : 'Add Medication'}
            </DialogTitle>
            <DialogDescription>
              {editingMed
                ? 'Update the details for this medication.'
                : 'Fill in the details to add a new medication to your schedule.'}
            </DialogDescription>
          </DialogHeader>
          <MedicationForm
            mode={editingMed ? 'edit' : 'add'}
            initialData={editingMed ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            isLoading={isMutating}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Medication?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this medication and all its dose history. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
