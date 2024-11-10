import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormsModule } from '@angular/forms';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';

@NgModule({
  declarations: [AdminComponent, AdminDashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule,
    NzDatePickerModule,
    NzTabsModule,
    NzButtonModule,
    NzTimePickerModule
  ],
})
export class AdminModule {}
