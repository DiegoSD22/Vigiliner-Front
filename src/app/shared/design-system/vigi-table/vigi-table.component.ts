
import { Component, Input, Output, EventEmitter, ViewChild, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { TableColumn, TableConfig, TableAction, PaginationData } from '../../interfaces/vigi-table.interfaces';
import { ColumnValuePipe } from '../../pipes/column-value.pipe';

@Component({
  selector: 'vigi-table',
  templateUrl: './vigi-table.component.html',
  styleUrls: ['./vigi-table.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, 
    MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator,
    ColumnValuePipe,
    MatIconModule
  ]
})
export class VigiTableComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() config?: TableConfig;
  @Input() total: number = 0;
  @Output() onPaginationChange = new EventEmitter<PaginationData>();
  @Output() onTableAction = new EventEmitter<TableAction>();

  public dataSource = new MatTableDataSource<any>();
  public displayedColumns: string[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.setupTable();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.setupTable();
  }

  setupTable() {
    this.dataSource.data = this.data;
    this.displayedColumns = this.columns.map(col => col.def);
    if (this.config?.actions && this.config.actions.length > 0 && !this.displayedColumns.includes('actions')) {
      this.displayedColumns.push('actions');
    }
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  getColumnByDef(def: string): TableColumn | undefined {
    return this.columns.find(col => col.def === def);
  }

  onPaginateChange(event: PageEvent) {
    const takeFrom = event.pageIndex * event.pageSize;
    const paginationData: PaginationData = { limit: event.pageSize, from: takeFrom };
    this.onPaginationChange.emit(paginationData);
  }

  onActionClick(action: string, row: any) {
    this.onTableAction.emit({ action, row });
  }
}