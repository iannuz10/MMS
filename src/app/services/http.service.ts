import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../Message';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  code: string = "4/0AWtgzh431cll-I_1LAVH_IwKm9fnyqoWR4oTJCBjN7plc3fDTgwX32RW4BuHXcJLcAx2WA";
  urlAuth:string = "https://is0fiqsf2i.execute-api.eu-central-1.amazonaws.com/prod/auth/generate-token";
  urlVideoApi:string = "https://is0fiqsf2i.execute-api.eu-central-1.amazonaws.com/prod/video/get-random";

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
    return this.http.post<any>(this.urlAuth, msg);
  }

  getVideo(token:any): Observable<any> {
    const tk = `Bearer ${token}`;
    console.log("my token:", tk)
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Access-Control-Allow-Origin': '*',
      'Authorization': tk
      // 'Authorization': token
    });
    console.log(header)
    const msg = new Message();
    return this.http.get<any>(this.urlVideoApi);
  }
}
