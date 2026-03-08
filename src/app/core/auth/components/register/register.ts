import { Auth } from './../../services/auth/auth';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, FaIconComponent],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router)
  private readonly fb = inject(FormBuilder);
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faSpinner = faSpinner;
  showPassword: boolean = false;
  showRePassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  sub$: Subscription = new Subscription();
  registerform!: FormGroup;

  ngOnInit(): void {
    this.registerform = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        username: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$'),
          ],
        ],
        rePassword: [''],
        dateOfBirth: ['', [Validators.required]],
        gender: ['', [Validators.required]],
      },
      { validators: [this.HandleRepasswordValidation] },
    );
  }

  HandleRepasswordValidation(group: AbstractControl) {
    const password = group.get('password')?.value;
    const repassword = group.get('rePassword')?.value;

    if (password !== repassword && repassword !== '') {
      group.get('rePassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      return null;
    }
  }

  subminRegister(): void {
    if (this.registerform.valid) {
      this.errorMessage = '';
      this.successMessage = '';
      this.isLoading = true;
      this.sub$.unsubscribe();
      this.sub$ = this.auth.sendRegisterData(this.registerform.value).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res.success) {
            this.successMessage = res.message;
            this.errorMessage = '';
            this.router.navigate(['/login'])
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          this.errorMessage = err.error.message;
          this.successMessage = '';
        },
      });
    }
  }
}
