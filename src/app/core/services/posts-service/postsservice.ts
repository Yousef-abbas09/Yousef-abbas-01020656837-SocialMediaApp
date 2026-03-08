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
      authorization: `Bearer ${localStorage.getItem('token')!}`
    }
  });
}



  CreatPost(data:object): Observable<any> {
  return this.httpClient.post(environment.base_url + '/posts', data,{
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')!}`
    }
  });
}



  GetSinglePost(data:object , postId:string): Observable<any> {
  return this.httpClient.post(environment.base_url + '/posts/'+postId, data,{
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')!}`
    }
  });
}
}