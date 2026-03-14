import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class Notificationservice {
  private readonly httpClient = inject(HttpClient);

  GetNotifications(): Observable<any> {
    return this.httpClient.get(environment.base_url + `/notifications`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')!}`,
      },
    });
  }

  MarkAllAsRead(): Observable<any> {
    return this.httpClient.patch(
      environment.base_url + `/notifications/read-all`,
      {}, // الـ Body (فاضي لو الـ API مش محتاج)
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem('token')!}`,
        },
      },
    );
  }

  MarkNotiAsRead(notificationId: string): Observable<any> {
    return this.httpClient.patch(
      environment.base_url + `/notifications/${notificationId}/read`,
      {}, // الـ Body (فاضي لو الـ API مش محتاج)
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem('token')!}`,
        },
      },
    );
  }
}
