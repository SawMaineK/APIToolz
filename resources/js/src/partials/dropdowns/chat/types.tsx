export interface IDropdownChatProps {
  menuTtemRef: any;
  slug: string;
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
