import { Profileservice } from './../../core/services/profileservice/profileservice';
import { Subscription } from 'rxjs';
import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [DatePipe, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit, OnDestroy {
  private readonly profileservice = inject(Profileservice);
  private readonly cdr = inject(ChangeDetectorRef);

  profileSub!: Subscription;
  bookmarkSub!: Subscription;
  postsSub!: Subscription;
  uploadSub!: Subscription;

  user: any = null;
  isLoading: boolean = false;
  bookmarks: any[] = [];
  myPosts: any[] = [];
  activeTab: 'posts' | 'saved' = 'posts';

  // Photo upload
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  showPhotoModal: boolean = false;
  isUploading: boolean = false;

  // Toast
  toastMessage: string = '';
  toastVisible: boolean = false;
  toastType: 'success' | 'error' = 'success';

  ngOnInit(): void {
    this.GetDataProfile();
    this.GetMyPosts();
    this.GetMyBookmarks();
  }

  GetDataProfile(): void {
    this.isLoading = true;
    this.profileSub = this.profileservice.GetProfileData().subscribe({
      next: (res) => {
        this.user = res.data.user;

        // ── update localStorage بالصورة الجديدة ──
        const stored = localStorage.getItem('userdata');
        if (stored) {
          const userData = JSON.parse(stored);
          userData.photo = res.data.user.photo;
          localStorage.setItem('userdata', JSON.stringify(userData));
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
      },
    });
  }

  GetMyBookmarks(): void {
    this.bookmarkSub = this.profileservice.GetSavedPosts().subscribe({
      next: (res) => {
        this.bookmarks = res.data.bookmarks;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  GetMyPosts(): void {
    this.postsSub = this.profileservice.GetMyposts().subscribe({
      next: (res) => {
        this.myPosts = res.data.posts;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  setTab(tab: 'posts' | 'saved'): void {
    this.activeTab = tab;
  }

  // ─── Photo Upload ───────────────────────────────────────────

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.selectedFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
      this.showPhotoModal = true;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(this.selectedFile);
  }

  cancelPhotoUpload(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.showPhotoModal = false;
  }

  confirmPhotoUpload(): void {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('photo', this.selectedFile);

    this.isUploading = true;

    this.uploadSub = this.profileservice.UploadProfilePhoto(formData).subscribe({
      next: () => {
        this.isUploading = false;
        this.showPhotoModal = false;
        this.selectedFile = null;
        this.previewUrl = null;
        this.showToast('Profile photo updated successfully!', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.isUploading = false;
        this.showToast('Failed to update photo. Try again.', 'error');
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
    this.profileSub?.unsubscribe();
    this.bookmarkSub?.unsubscribe();
    this.postsSub?.unsubscribe();
    this.uploadSub?.unsubscribe();
  }
}
