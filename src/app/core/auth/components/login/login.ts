import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth/auth';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, FaIconComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);
  private readonly fb = inject(FormBuilder);
  errorMessage: string = '';
  isLoading: boolean = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faSpinner = faSpinner;
  showPassword: boolean = false;
  sub$: Subscription = new Subscription();

  loginForm!: FormGroup;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  submitLogin(): void {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      this.isLoading = true;
      this.sub$.unsubscribe();
      this.sub$ = this.auth.sendLoginData(this.loginForm.value).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res.success) {
            localStorage.setItem('token', res.data.token);
            this.router.navigate(['/feed']);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          this.errorMessage = err.error.message;
        },
      });
    }
  }
}
