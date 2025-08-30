// interfaces/menu-item.interface.ts
export interface NavMenuItem {
  label?: string;  // Opcional
  icon?: string;   // Opcional
  separator?: boolean;
  items?: Array<{
    label?: string;      // Opcional
    icon?: string;       // Opcional
    command?: () => void;
    separator?: boolean;
  }>;
}

export interface SidebarMenuItem {
  label: string;
  icon: string;        // Requerido
  routerLink?: string;
  expanded?: boolean;  // Para controlar submenús
  items?: SidebarMenuItem[];
}