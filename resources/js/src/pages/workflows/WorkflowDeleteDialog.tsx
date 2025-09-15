import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Workflow } from './Workflows';

interface DeleteDialogProps {
  open: boolean;
  data: Workflow | undefined;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

export default function WorkflowDeleteDialog({
  open,
  onOpenChange,
  data,
  onDelete
}: DeleteDialogProps) {
  const [deleteTable, setDeleteTable] = useState(false);

  const handleDelete = () => {
    if (data) {
      onDelete();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete {data?.name}?</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="grid gap-5">
            <DialogDescription>
              Are you sure you want to delete this {data?.name}? This action cannot be undone.
            </DialogDescription>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
