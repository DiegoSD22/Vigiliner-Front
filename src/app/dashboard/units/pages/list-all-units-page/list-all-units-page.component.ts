import { Component } from '@angular/core';
import { VigiTableComponent } from '../../../../shared/design-system/vigi-table/vigi-table.component';
import { TableColumn, TableConfig } from '../../../../shared/interfaces/vigi-table.interfaces';

@Component({
  selector: 'list-all-units-page',
  standalone: true,
  templateUrl: './list-all-units-page.component.html',
  imports: [VigiTableComponent]
})
export class ListAllUnitsPageComponent {
  units = [
    { id: 1, name: 'Unidad Alfa', type: 'Vehículo', status: 'Activo' },
    { id: 2, name: 'Unidad Beta', type: 'Dron', status: 'Inactivo' },
    { id: 3, name: 'Unidad Gamma', type: 'Vehículo', status: 'Activo' }
  ];

  columns: TableColumn[] = [
    { label: 'ID', def: 'id', dataKey: 'id' },
    { label: 'Nombre', def: 'name', dataKey: 'name' },
    { label: 'Tipo', def: 'type', dataKey: 'type' },
    { label: 'Estado', def: 'status', dataKey: 'status' }
  ];

  tableConfig: TableConfig = {
    pagination: false,
    noDataMessage: 'No hay unidades para mostrar.'
  };
}
