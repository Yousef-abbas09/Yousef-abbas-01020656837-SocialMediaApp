import { ChangePassword } from './../../../features/change-password/change-password';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChangePasswordService {
  private readonly httpClient = inject(HttpClient)

    
  ChangePassword(data:object): Observable<any> {
      return this.httpClient.patch(environment.base_url + `/users/change-password`, data,{
        headers: {
          authorization: `Bearer ${localStorage.getItem('token')!}`,
        },
      });
    }
}
