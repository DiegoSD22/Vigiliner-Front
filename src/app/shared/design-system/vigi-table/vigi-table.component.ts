
import { Component, Input, Output, EventEmitter, ViewChild, OnInit, OnChanges, SimpleChanges, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { TableColumn, TableConfig, TableAction, PaginationData } from '../../interfaces/vigi-table.interfaces';
import { ColumnValuePipe } from '../../pipes/column-value.pipe';

@Component({
  selector: 'vigi-table',
  templateUrl: './vigi-table.component.html',
  styleUrls: ['./vigi-table.component.css'],
  imports: [
    CommonModule,
    MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, 
    MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, ColumnValuePipe,
    MatIconModule
  ]
})
export class VigiTableComponent {

  data = input<any[]>([]);
  columns = input<TableColumn[]>([]);
  public displayedColumns: string[] = [];




  @Input() config?: TableConfig;
  @Input() total: number = 0;
  @Output() onPaginationChange = new EventEmitter<PaginationData>();
  @Output() onTableAction = new EventEmitter<TableAction>();

  public dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    effect(() => {
      this.displayedColumns = this.columns().map(col => col.def);
    });
  }

}