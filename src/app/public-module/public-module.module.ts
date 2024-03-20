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
@NgModule({
  declarations: [
    PublicModuleComponent,
    NavbarComponent,
    FooterComponent,
    HeaderComponent,
    LandingPageComponent,
    AboutComponent,
  ],
  imports: [CommonModule, PublicModuleRoutingModule, NzIconModule],
})
export class PublicModule {}
