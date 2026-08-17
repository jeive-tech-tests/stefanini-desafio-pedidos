import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-shell',
  imports: [HeaderComponent, RouterOutlet, ToastModule],
  templateUrl: './shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {}
