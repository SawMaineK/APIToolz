import { Model } from "@/pages/model/_models";

export interface IDropdownChatProps {
  menuTtemRef: any;
  model: Model;
  type: string;
}

export type DropdownChatMessageType = 'in' | 'out';

export interface IDropdownMessage {
  avatar?: string;
  time: string;
  text: string;
  read?: boolean;
  in?: boolean;
  out?: boolean;
}
