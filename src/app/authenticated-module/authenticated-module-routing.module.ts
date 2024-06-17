import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticatedModuleComponent } from './authenticated-module.component';

const routes: Routes = [
  {
    path: '',
    component: AuthenticatedModuleComponent,
    children: [
      {
        path: 'customer',
        loadChildren: () =>
          import('./customer/customer.module').then((m) => m.CustomerModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthenticatedModuleRoutingModule {}
