import { Pipe, PipeTransform } from '@angular/core';
import { TableColumn } from '../interfaces/vigi-table.interfaces';
import { DatePipe, TitleCasePipe } from '@angular/common';

@Pipe({
    name: 'columnValue'
})
export class ColumnValuePipe implements PipeTransform 
{
  transform(row: any, column: TableColumn | undefined): unknown 
  {
    if (!column) return '🔸';
    let displayValue = row[column.dataKey];

    // Aplicar pipe si existe
    if(column.pipe)
    {
      switch(column.pipe)
      {
        case 'currency':
          return this.convertCurrency(displayValue);
        case 'number':
          return this.convertNumber(displayValue);
        case 'titlecase':
          return this.convertTitleCase(displayValue);
      }
    }

    switch ( column.dataType ) 
    {
      case 'date':
        displayValue = this.convertDate(column, displayValue);
      break;

      case 'object':
        displayValue = this.convertObject(column, row);
      break;

      case 'amount':
        displayValue = this.convertAmount(displayValue);
      break;
    
      default:
      break;
    }

    return displayValue;
  }

  /**
   * Convertir una fecha en el formato estandar
   */
  convertDate( column: TableColumn, displayValue: any )
  {
    if( column.format === undefined )
    {
      return new DatePipe('es-CO').transform(displayValue, 'medium') ?? '🔸';
    }

    return '🔸';
  }

  /**
   * Extraer la propiedad que se necesita del objeto
   */
  convertObject( column: TableColumn, row: any )
  {
    const keyList = column.dataKey.split('.');
    let currentValue: any = row;
    for (const key of keyList) {
      if (currentValue == null) {
        return '🔸';
      }
      currentValue = currentValue[key];
    }
    // Si el valor final es null o undefined, retornar diamante gris
    return currentValue == null ? '🔸' : currentValue;
  }

  convertAmount( displayValue: any )
  {
    if( typeof displayValue !== 'number' ) return '🔸';

    return `$${displayValue.toLocaleString()}`;
  }

  convertCurrency(displayValue: any): string
  {
    if(typeof displayValue !== 'number') return '🔸';
    return `$ ${displayValue.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  convertNumber(displayValue: any): string
  {
    if(typeof displayValue !== 'number') return '🔸';
    return displayValue.toLocaleString('es-CO');
  }

  convertTitleCase(displayValue: any): string
  {
    if(displayValue === null || displayValue === undefined) return '🔸';
    return new TitleCasePipe().transform(String(displayValue)) ?? '🔸';
  }
}
