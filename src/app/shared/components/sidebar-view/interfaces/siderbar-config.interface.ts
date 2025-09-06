export type SidebarPosition = 'left' | 'right' | 'top' | 'bottom';
export type SidebarSize = 'small' | 'medium' | 'large' | 'full';
export interface SidebarConfig {
  visible: boolean;
  position?: 'left' | 'right' | 'top' | 'bottom';
  modal?: boolean;
  dismissible?: boolean;
  closeOnEscape?: boolean;
  blockScroll?: boolean;
  baseZIndex?: number;
  autoZIndex?: boolean;
  style?: any;
  size?: SidebarSize;
  styleClass?: string;
}