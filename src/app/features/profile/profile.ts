import { Profileservice } from './../../core/services/profileservice/profileservice';
import { Subscription } from 'rxjs';
import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit, OnDestroy {
  private readonly profileservice = inject(Profileservice);
  private readonly cdr = inject(ChangeDetectorRef);
  profileSub!: Subscription;
bookmarkSub!: Subscription;
  user: any = null;
  isLoading: boolean = false;

  ngOnInit(): void {
    this.GetDataProfile();
    this.GetMyBookmarks();
  }

  GetDataProfile(): void {
  this.isLoading = true;

  this.profileSub = this.profileservice.GetProfileData().subscribe({
    next: (res) => {
      this.user = res.data.user;
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.log(err);
      this.isLoading = false;
    },
  });
}


bookmarks: any[] = [];

GetMyBookmarks(): void {
  this.bookmarkSub = this.profileservice.GetSavedPosts().subscribe({
    next: (res) => {
      this.bookmarks = res.data.bookmarks;
      console.log(this.bookmarks);
    },
    error: (err) => {
      console.log(err);
    },
  });
}

  ngOnDestroy(): void {
  this.profileSub?.unsubscribe();
  this.bookmarkSub?.unsubscribe();
}
}
