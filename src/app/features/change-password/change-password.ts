import { Component, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ChangePasswordService } from '../../core/services/change-password-service/change-password-service';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword implements OnDestroy {
  private readonly changePasswordService = inject(ChangePasswordService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  changeSub!: Subscription;
  isLoading: boolean = false;
  toastVisible: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  form: FormGroup = this.fb.group(
    {
      password: ['', [Validators.required]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$'),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: [this.confirmMatchValidator, this.notSameAsOldValidator],
    },
  );

  confirmMatchValidator(group: AbstractControl) {
    const newPass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (confirm && newPass !== confirm) {
      group.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      const errors = group.get('confirmPassword')?.errors;
      if (errors) {
        delete errors['mismatch'];
        const hasErrors = Object.keys(errors).length > 0;
        group.get('confirmPassword')?.setErrors(hasErrors ? errors : null);
      }
    }
    return null;
  }

  notSameAsOldValidator(group: AbstractControl) {
    const oldPass = group.get('password')?.value;
    const newPass = group.get('newPassword')?.value;
    if (oldPass && newPass && oldPass === newPass) {
      group.get('newPassword')?.setErrors({ sameAsOld: true });
    } else {
      const errors = group.get('newPassword')?.errors;
      if (errors) {
        delete errors['sameAsOld'];
        const hasErrors = Object.keys(errors).length > 0;
        group.get('newPassword')?.setErrors(hasErrors ? errors : null);
      }
    }
    return null;
  }

  get password() {
    return this.form.get('password');
  }
  get newPassword() {
    return this.form.get('newPassword');
  }
  get confirmPassword() {
    return this.form.get('confirmPassword');
  }

  ChangePasswordOfUser(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.changeSub) this.changeSub.unsubscribe();

    this.isLoading = true;

    const data = {
      password: this.form.get('password')?.value,
      newPassword: this.form.get('newPassword')?.value,
    };

    console.log('Sending:', data); // تأكد إن الداتا صح قبل ما تشيل السطر ده

    this.changeSub = this.changePasswordService.ChangePassword(data).subscribe({
      next: () => {
        this.isLoading = false;
        this.form.reset();
        this.showToast('Password updated successfully!', 'success');
        setTimeout(() => window.location.reload(), 1500);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message || 'Something went wrong. Try again.';
        this.showToast(msg, 'error');
        this.cdr.detectChanges();
      },
    });
  }
  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    setTimeout(() => {
      this.toastVisible = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  ngOnDestroy(): void {
    this.changeSub?.unsubscribe();
  }
}
