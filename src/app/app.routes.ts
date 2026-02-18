import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard'
import { VigiTableComponent } from './shared/design-system/vigi-table/vigi-table.component';

export const routes: Routes = [
    {path: '', component: Dashboard},
    {path: 'table', component: VigiTableComponent}
];
