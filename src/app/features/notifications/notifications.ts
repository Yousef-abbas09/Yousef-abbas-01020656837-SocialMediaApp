import { Notificationservice } from './../../core/services/notification-service/notificationservice';
import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [DatePipe], // عشان الـ date pipe يشتغل
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css'],
})
export class Notifications implements OnInit, OnDestroy {
  private readonly notificationservice = inject(Notificationservice);

  // بنستخدم signal عشان نضمن إن الـ HTML يحس بالداتا فوراً
  notificationsList = signal<any[]>([]);
  sub$ = new Subscription();

  ngOnInit(): void {
    this.GetDataNoti();
  }

  GetDataNoti(): void {
    this.sub$.unsubscribe();
    this.sub$ = this.notificationservice.GetNotifications().subscribe({
      next: (res: any) => {
        // بنسكن الداتا جوه الـ signal
        this.notificationsList.set(res.data.notifications);
        console.log('Data loaded successfully');
      },
      error: (err: any) => {
        console.error('Error:', err);
      },
    });
  }

  // function عشان تحول الـ type لكلام مفهوم
  getActionMessage(type: string): string {
    const messages: Record<string, string> = {
      follow_user: 'started following you',
      like_post: 'liked your post',
      comment_post: 'commented on your post',
      share_post: 'shared your post',
    };
    return messages[type] || 'interacted with you';
  }

  MarkallAsRead(): void {
    // 1. بننادي السيرفس
    this.sub$ = this.notificationservice.MarkAllAsRead().subscribe({
      next: (res) => {
        console.log('All marked as read:', res);

        // 2. تحديث سريع للداتا بدون ريلود للصفحة (Optimistic UI)
        // بنعدل الـ signal عشان نخلي كل الـ isRead بـ true
        const updatedList = this.notificationsList().map((noti) => ({
          ...noti,
          isRead: true,
        }));

        this.notificationsList.set(updatedList);

        // (اختياري) ممكن تنادي الداتا تاني لو عايز تتأكد 100% من السيرفر
        // this.GetDataNoti();
      },
      error: (err) => {
        console.error('Error marking all as read:', err);
      },
    });
  }

  MarkNotiAsRead(NotiId: string): void {
    this.sub$.unsubscribe();
    this.sub$ = this.notificationservice.MarkNotiAsRead(NotiId).subscribe({
      next: (res) => {
        console.log(res);
        const updatedList = this.notificationsList().map((noti) => ({
          ...noti,
          isRead: true,
        }));

        this.notificationsList.set(updatedList);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  ngOnDestroy(): void {
    this.sub$.unsubscribe();
  }
}
