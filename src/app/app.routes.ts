import { Routes } from '@angular/router';
import { AllPropertiesComponent } from './components/all-properties/all-properties.component';
import { UserBookingsListComponent } from './components/user-bookings-list/user-bookings-list.component';
import { UserPropertiesListComponent } from './components/user-properties-list/user-properties-list.component';


export const routes: Routes = [
    { path: 'all-properties', component: AllPropertiesComponent },
    { path: 'my-properties', component: UserPropertiesListComponent },
    { path: 'my-bookings', component: UserBookingsListComponent },
];
