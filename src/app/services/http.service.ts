import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../Message';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  code: string = "4/0AWtgzh431cll-I_1LAVH_IwKm9fnyqoWR4oTJCBjN7plc3fDTgwX32RW4BuHXcJLcAx2WA";
  url:string = "https://is0fiqsf2i.execute-api.eu-central-1.amazonaws.com/prod/auth/generate-token";

  constructor(private http: HttpClient) {
  }

  postToken(cod:string): Observable<any> {
    // const headers = new HttpHeaders();
    // const headers = { 'content-type': 'json', "Access-Control-Allow-Origin": '*'};
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    const msg = new Message();
    msg.code = cod;
    // const body = {'code': this.code};
    // console.log(header);
    return this.http.post<any>(this.url, msg);
  }
}
