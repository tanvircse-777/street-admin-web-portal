import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicModuleRoutingModule } from './public-module-routing.module';
import { PublicModuleComponent } from './public-module.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AboutComponent } from './about/about.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
@NgModule({
  declarations: [
    PublicModuleComponent,
    NavbarComponent,
    FooterComponent,
    HeaderComponent,
    LandingPageComponent,
    AboutComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PublicModuleRoutingModule,
    NzIconModule,
    NzSpinModule,
    NzModalModule,
    NzButtonModule,
    GoogleSigninButtonModule
  ],
})
export class PublicModule {}
