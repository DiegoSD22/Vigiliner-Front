// Interfaces para la tabla reusable VigiTable

export interface TableColumn {
    label: string;   // Etiqueta de la cabecera
    def: string;     // MatColumnDef
    dataKey: string; // Se utiliza para mostrar la data
    format?: string; // si es una fecha se puede pasar opcionalmente el formato
    dataType?: 'date' | 'object' | 'amount'; // para identificar una columna con un tipo de dato especial
    pipe?: 'currency' | 'number' | 'titlecase'; // para aplicar pipes de formato a los valores
    bold?: boolean; // para aplicar negrita a los valores de la columna
    class?: string; // clase css personalizada para la celda
    withEditButton?: boolean; // para mostrar un botón de edición en cada fila de esta columna
}

export interface TableConfig {
    actions?: TableAction[];
    pagination?: boolean;
    totalItemsPagination?: number;
    noDataMessage?: string;
}

export interface TableAction<T = any> {
    action: string; // Usar string para acción genérica
    row: T | null;
    color?: string;
    title?: string;
    icon?: string;
}

export interface PaginationData {
    limit: number;
    from: number;
}
