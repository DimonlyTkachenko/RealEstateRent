import { Routes } from '@angular/router';
import { AllPropertiesComponent } from './components/all-properties/all-properties.component';
import { UserBookingsListComponent } from './components/user-bookings-list/user-bookings-list.component';
import { UserPropertiesListComponent } from './components/user-properties-list/user-properties-list.component';
import { PropertyCreateComponent } from './components/property-create/property-create.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'all-properties', pathMatch: 'full' },
  { path: 'all-properties', component: AllPropertiesComponent },
  {
    path: 'my-properties',
    component: UserPropertiesListComponent,
    canActivate: [AuthGuard],
    children: [{ path: 'create-property', component: PropertyCreateComponent, canActivate: [AuthGuard] }],
  },
  { path: 'my-bookings', component: UserBookingsListComponent, canActivate: [AuthGuard] },
];
