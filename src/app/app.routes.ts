import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard'
import { ListAllUnitsPageComponent } from './dashboard/units/pages/list-all-units-page/list-all-units-page.component';

export const routes: Routes = [
    {path: '', component: Dashboard},
    {path: 'units', component: ListAllUnitsPageComponent}
];
