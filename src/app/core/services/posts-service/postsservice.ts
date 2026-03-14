import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Postsservice {
  private readonly httpClient = inject(HttpClient);

  GetAllPosts(): Observable<any> {
    return this.httpClient.get(environment.base_url + '/posts', {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')!}`,
      },
    });
  }

  CreatPost(data: object): Observable<any> {
    return this.httpClient.post(environment.base_url + '/posts', data, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')!}`,
      },
    });
  }

  GetSinglePost(postId: string): Observable<any> {
  return this.httpClient.get(environment.base_url + '/posts/' + postId, {
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')!}`,
    },
  });
}

  SharePost(body: Object, postId: string) {
    return this.httpClient.post(environment.base_url + `/posts/${postId}/share`, body, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')!}`,
      },
    });
  }

  GetFollowSugg(): Observable<any> {
    return this.httpClient.get(environment.base_url + '/users/suggestions?limit=10', {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')!}`,
      },
    });
  }

  FollowORUnfollowUser(userId: string): Observable<any> {
    return this.httpClient.put(
      environment.base_url + `/users/${userId}/follow`,
      {},
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem('token')!}`,
        },
      },
    );
  }

  LikeORUnlikePost(postId: string): Observable<any> {
    return this.httpClient.put(
      environment.base_url + `/posts/${postId}/like`,
      {},
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem('token')!}`,
        },
      },
    );
  }

  DeletePost(postId: string): Observable<any> {
    return this.httpClient.delete(environment.base_url + `/posts/${postId}`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')!}`,
      },
    });
  }

  UpdatePost(data: object, postId: string): Observable<any> {
    return this.httpClient.put(environment.base_url + `/posts/${postId}`, data, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')!}`,
      },
    });
  }




  BookmarkUnbookmarkPost(postId: string): Observable<any> {
    return this.httpClient.put(environment.base_url + `/posts/${postId}/bookmark`, {}, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')!}`,
      },
    });
  }

  
}
