import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../../features/navbar/navbar';


@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Navbar],
  template: `
    <app-navbar />
    <router-outlet />
  `,
})
export class MainLayout {}