import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  // { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES) }
  { path: '',  loadChildren: () =>
  import("./public-module/public-module.module").then(
    (m) => m.PublicModule
  ),}
];
