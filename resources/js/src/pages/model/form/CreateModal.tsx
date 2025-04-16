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

interface IModalProps {
  open: boolean;
  model: Model;
  modelData?: any;
  onOpenChange: () => void;
  onCreated: (data: any) => void;
}

const CreateModal = ({ open, model, modelData, onOpenChange, onCreated }: IModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {modelData ? `Edit` : `New`} {model.title}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 px-0 py-0">
          <DialogBody>
            <Create model={model} modelData={modelData} onCreated={onCreated} isModal={true} />
          </DialogBody>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { CreateModal };
