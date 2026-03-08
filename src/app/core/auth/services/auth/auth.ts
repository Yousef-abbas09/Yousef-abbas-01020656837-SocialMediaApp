import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly httpClient = inject(HttpClient);

  sendRegisterData(data: object): Observable<any> {
    return this.httpClient.post(environment.base_url+'/users/signup', data);
  }

  sendLoginData(data: object): Observable<any> {
    return this.httpClient.post(environment.base_url+'/users/signin', data);
  }
}