import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class Commentsservice {
  private readonly httpClient = inject(HttpClient);

  GetAllComments(postId: string): Observable<any> {
    return this.httpClient.get(environment.base_url + `/posts/${postId}/comments`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')!}`,
      },
    });
  }

  CreateComment(data: Object, postId: string): Observable<any> {
    return this.httpClient.post(environment.base_url + `/posts/${postId}/comments`, data, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')!}`,
      },
    });
  }

  UpdateComment(data: object, postId: string, commentId: string) {
    return this.httpClient.put(
      environment.base_url + `/posts/${postId}/comments/${commentId}`,
      data,
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem('token')!}`,
        },
      },
    );
  }

  DeleteComment(postId: string, commentId: string): Observable<any> {
    return this.httpClient.delete(environment.base_url + `/posts/${postId}/comments/${commentId}`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('token')!}`,
      },
    });
  }

  LikeOrDislikeComment(commentId: string, postId: string): Observable<any> {
    return this.httpClient.put(
      environment.base_url + `/posts/${postId}/comments/${commentId}/like`,
      {},
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem('token')!}`,
        },
      },
    );
  }

  CreatReply(data: object, postId: string, commentId: string): Observable<any> {
    return this.httpClient.post(
      environment.base_url + `/posts/${postId}/comments/${commentId}/replies`,
      data,
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem('token')!}`,
        },
      },
    );
  }

  GetReply(data: object, postId: string, commentId: string): Observable<any> {
    return this.httpClient.get(
      environment.base_url + `/posts/${postId}/comments/${commentId}/replies`,
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem('token')!}`,
        },
      },
    );
  }


}
