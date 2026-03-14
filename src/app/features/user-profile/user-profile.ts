import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Profileservice } from '../../core/services/profileservice/profileservice';
import { Subscription } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  imports: [RouterLink, DatePipe , TitleCasePipe],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile implements OnInit, OnDestroy {
  private readonly profileservice = inject(Profileservice);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  prof_detailssub!: Subscription;
  prof_postssub!: Subscription;

  user: any = null;
  posts: any[] = [];
  isLoading: boolean = false;
  isPostsLoading: boolean = false;
  showPopup: 'followers' | 'following' | null = null;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.user = null;
      this.posts = [];
      this.showPopup = null;
      this.GetThisProfileData(params['id']);
      this.GetUserPosts(params['id']);
    });
  }

  GetThisProfileData(userId: string): void {
    this.isLoading = true;
    this.prof_detailssub = this.profileservice.GetUsersProfile(userId).subscribe({
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

  GetUserPosts(userId: string): void {
    this.isPostsLoading = true;
    this.prof_postssub = this.profileservice.GetUsersPosts(userId).subscribe({
      next: (res) => {
        this.posts = res.data.posts;
        this.isPostsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.isPostsLoading = false;
      },
    });
  }

  openPopup(type: 'followers' | 'following'): void {
    this.showPopup = type;
  }

  closePopup(): void {
    this.showPopup = null;
  }

  ngOnDestroy(): void {
    this.prof_detailssub?.unsubscribe();
    this.prof_postssub?.unsubscribe();
  }
}