import { environment } from './../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Profileservice {
  private readonly httpClient = inject(HttpClient);

  GetProfileData(): Observable<any> {
    return this.httpClient.get(environment.base_url + `/users/profile-data`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')!}`,
      },
    });
  }

  GetSavedPosts(): Observable<any> {
    return this.httpClient.get(environment.base_url + `/users/bookmarks`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')!}`,
      },
    });
  }
}
