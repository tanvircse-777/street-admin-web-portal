import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-authenticated-module',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './authenticated-module.component.html',
  styleUrl: './authenticated-module.component.scss'
})
export class AuthenticatedModuleComponent {

}
