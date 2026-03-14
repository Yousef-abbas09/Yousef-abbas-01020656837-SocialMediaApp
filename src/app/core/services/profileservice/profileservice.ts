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

  GetMyposts(): Observable<any> {
    let MyId: string = JSON.parse(localStorage.getItem('userdata')!)._id;
    return this.httpClient.get(environment.base_url + `/users/${MyId}/posts`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')!}`,
      },
    });
  }




  UploadProfilePhoto(img:Object): Observable<any> {
    return this.httpClient.put(environment.base_url + `/users/upload-photo`, img,{
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')!}`,
      },
    });
  }


  GetUsersProfile(userId:string): Observable<any> {
     return this.httpClient.get(environment.base_url + `/users/${userId}/profile`,{
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')!}`,
      },
    });
  }


  GetUsersPosts(userId:string): Observable<any> {
     return this.httpClient.get(environment.base_url + `/users/${userId}/posts`,{
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')!}`,
      },
    });
  }


}
