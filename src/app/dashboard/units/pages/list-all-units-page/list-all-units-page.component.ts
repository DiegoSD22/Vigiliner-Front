
import { Component, OnInit, signal, inject } from '@angular/core';
import { VigiTableComponent } from '../../../../shared/design-system/vigi-table/vigi-table.component';
import { TableColumn, TableConfig, TableAction, PaginationData } from '../../../../shared/interfaces/vigi-table.interfaces';
import { UnitsService } from '../../services/units.service';
import { UnitDto, GetUnitsQueryDto } from '../../interfaces/units.dtos';

@Component({
  selector: 'list-all-units-page',
  standalone: true,
  templateUrl: './list-all-units-page.component.html',
  imports: [VigiTableComponent]
})
export class ListAllUnitsPageComponent implements OnInit {
  private readonly unitsService = inject(UnitsService);

  // Signals
  public units = signal<UnitDto[]>([]);
  public total = signal(0);

  // Table columns
  columns: TableColumn[] = [
    { label: 'ID', def: 'id', dataKey: 'id' },
    { label: 'Nombre', def: 'name', dataKey: 'name' },
    { label: 'Tipo', def: 'type', dataKey: 'type' },
    { label: 'Estado', def: 'status', dataKey: 'status' }
  ];

  // Table config
  tableConfig: TableConfig = {
    pagination: true,
    noDataMessage: 'No hay unidades para mostrar.'
  };

  // Query for pagination/search
  private query: GetUnitsQueryDto = {
    limit: 10,
    from: 0
  };

  ngOnInit() {
    this.loadAllUnits();
  }

  loadAllUnits() {
    this.unitsService.getAllUnits(this.query).subscribe(
      response => {
        this.units.set(response.units);
        this.total.set(response.total);
      }
    );
  }

  onPaginationChange(pagination: PaginationData) {
    this.query.limit = pagination.limit;
    this.query.from = pagination.from;
    this.loadAllUnits();
  }

  onTableAction(action: TableAction) {
    // Aquí puedes manejar acciones como editar/eliminar
    // Ejemplo: if (action.action === 'edit') { ... }
  }
}
