import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Create } from './Create';
import { Model } from '../_models';

interface IModalProfileProps {
  open: boolean;
  data: Model;
  onOpenChange: () => void;
}

const CreateModal = ({ open, onOpenChange, data }: IModalProfileProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New {data.title}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 px-0 py-2">
          <DialogBody>
            <Create data={data} modal={true} />
          </DialogBody>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { CreateModal };
