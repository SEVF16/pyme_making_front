// data-table.models.ts - Simplificado
export interface TableAction {
  label: string;
  icon: string;
  command: (rowData: any, rowIndex: number) => void;
  visible?: (rowData: any) => boolean;
  disabled?: (rowData: any) => boolean;
  severity?: string;
  tooltip?: string;
}

export interface TableColumn {
  field: string;
  header: string;
  width?: string;
  align?: string;
  hidden?: boolean;
  actions?: TableAction[];
  template?: 'custom' | 'badge' | 'avatar' | 'nameWithSubtitle';
  customRender?: (rowData: any) => string; // Función para renderizado custom
  subtitle?: string; // Campo para subtítulo (ej: RUT bajo el nombre)
  cssClass?: string;
}

export interface TableConfig {
  showPaginator?: boolean;
  rows?: number;
  rowsPerPageOptions?: number[];
  responsive?: boolean;
  emptyMessage?: string;
  lazy?: boolean;
  tableStyleClass?: string;
  dataKey?: string;
}

export interface TableState {
  totalRecords: number;
  first: number;
  rows: number;
}

export interface LazyLoadEvent {
  first: number;
  rows: number;
}

export interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}