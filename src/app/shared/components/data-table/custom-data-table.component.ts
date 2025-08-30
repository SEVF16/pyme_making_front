// custom-data-table.component.ts - Simplificado
import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy,
  ViewChild,
  signal,
  computed,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { LucideAngularModule, Edit, Eye, Trash2 } from 'lucide-angular';

// Models
import { 
  TableColumn, 
  TableConfig, 
  TableState, 
  LazyLoadEvent,
  TableAction,
  PageEvent
} from './models/data-table.models';

@Component({
  selector: 'app-custom-data-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    LucideAngularModule,
    ButtonModule,
    TooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './custom-data-table.component.html',
  styleUrl: './custom-data-table.component.scss'
})
export class CustomDataTableComponent implements OnInit {
  // Icons
  readonly EyeIcon = Eye;
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;

  // Inputs
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() config: TableConfig = {};

  // Outputs
  @Output() lazyLoad = new EventEmitter<LazyLoadEvent>();
  @Output() pageChange = new EventEmitter<PageEvent>();

  // ViewChild
  @ViewChild('dataTable') dataTable!: Table;

  // Signals
  readonly tableState = signal<TableState>({
    totalRecords: 0,
    first: 0,
    rows: 10
  });

  readonly visibleColumns = computed(() => 
    this.columns.filter(col => !col.hidden)
  );

  readonly tableStyleClass = computed(() => 
    `p-datatable-striped ${this.config.tableStyleClass || ''}`
  );

  ngOnInit(): void {
    this.tableState.update(state => ({
      ...state,
      rows: this.config.rows || 10,
      totalRecords: this.data.length
    }));
  }

  // Event handlers
  onLazyLoad(event: any): void {
    this.tableState.update(state => ({
      ...state,
      first: event.first,
      rows: event.rows
    }));

    this.lazyLoad.emit({
      first: event.first,
      rows: event.rows
    });
  }

  onPageChange(event: any): void {
    const pageEvent: PageEvent = {
      first: event.first,
      rows: event.rows,
      page: event.page,
      pageCount: Math.ceil(this.tableState().totalRecords / event.rows)
    };

    this.pageChange.emit(pageEvent);
  }

  // Utility methods
  getFieldValue(rowData: any, column: TableColumn): string {
    const value = rowData[column.field];
    return value != null ? String(value) : '';
  }

  getColumnStyle(column: TableColumn): any {
    const styles: any = {};
    if (column.width) styles.width = column.width;
    if (column.align) styles.textAlign = column.align;
    return styles;
  }

  getColumnClass(column: TableColumn): string {
    const classes = [];
    if (column.align) classes.push(`text-${column.align}`);
    return classes.join(' ');
  }

  getRowClass(rowData: any, rowIndex: number): string {
    return '';
  }

  // TrackBy function
  trackBy = (index: number, item: any): any => {
    return item[this.config.dataKey || 'id'] || index;
  };

  // Action methods
  getVisibleActions(actions: TableAction[], rowData: any): TableAction[] {
    return actions.filter(action => 
      !action.visible || action.visible(rowData)
    );
  }

  isActionDisabled(action: TableAction, rowData: any): boolean {
    return action.disabled ? action.disabled(rowData) : false;
  }

  executeAction(action: TableAction, rowData: any, rowIndex: number): void {
    action.command(rowData, rowIndex);
  }

  getActionIcon(iconName: string): any {
    const iconMap: Record<string, any> = {
      'eye': this.EyeIcon,
      'edit': this.EditIcon,
      'trash': this.Trash2Icon,
      'delete': this.Trash2Icon
    };
    return iconMap[iconName] || this.EyeIcon;
  }
}