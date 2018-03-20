import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JobHomeComponent } from './components/job.home.component';
import { JobAddComponent } from './components/job.add.component';
import { JobShowComponent } from './components/job.show.component';

const appRoutes: Routes = [
    {
        path: '',
        component: JobHomeComponent,
        pathMatch: 'full'
    },
    {
        path: 'job/add',
        component: JobAddComponent,
        pathMatch: 'full'
    },
    {
        path: 'job/show',
        component: JobShowComponent,
        pathMatch: 'full'
    }
];

export const routes: ModuleWithProviders = RouterModule.forRoot(appRoutes);