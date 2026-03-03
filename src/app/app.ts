import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastComponent } from './components/shared/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HttpClientModule, ReactiveFormsModule, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('revshop-app');
}
