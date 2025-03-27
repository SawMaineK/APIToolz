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
import { Checkbox } from '@/components/ui/checkbox';
import { Model } from './_models';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Model | null;
  onDelete: (deleteTable: boolean, data: Model) => void;
}

export default function ConfirmDeleteDialog({
  open,
  onOpenChange,
  data,
  onDelete
}: ConfirmDeleteDialogProps) {
  const [deleteTable, setDeleteTable] = useState(false);

  const handleDelete = () => {
    if (data) {
      onDelete(deleteTable, data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete {data?.title}?</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="grid gap-5">
            <DialogDescription>
              Are you sure you want to delete this {data?.title}? This action cannot be undone.
            </DialogDescription>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="delete-table"
                checked={deleteTable}
                onCheckedChange={(checked) => setDeleteTable(checked === true)}
              />
              <label htmlFor="delete-table" className="text-sm">
                Also delete associated table: {data?.table}
              </label>
            </div>
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
