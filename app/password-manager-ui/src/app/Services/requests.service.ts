import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Tokens } from '../models/tokens.model';
import { Observable, map, of, switchMap, tap } from 'rxjs';
import { PasswordInfo } from '../models/password-info.model';
import { EncryptionService } from './encryption.service';
import { TfaResponseModel } from '../models/tfa-response.model';
import { UserInfo } from 'os';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RequestsService {

  constructor(private http: HttpClient, private enc: EncryptionService) { }

  // This method sends a registration request for a new user
  makeRegisterRequest(email: string, password: string): Observable<Tokens>{
    return this.http.post<Tokens>(`${environment.root_url}${environment.register_endpoint}`, {username: email, password: password}).pipe(map(x => {
      localStorage.setItem(`${email}:username`, email);
      return x;
    }))
  }

  // This method sends a login request to the API for the user
  makeLoginRequest(email: string, password: string): Observable<Tokens>{
    return this.http.post<Tokens>(`${environment.root_url}${environment.login_endpoint}`, {username: email, password: password}).pipe(map(x => {
      return x;
    }))
  }

  // This method is used to get the currently logged in users data
  getUser(){
    return this.http.get<UserModel>(`${environment.root_url}${environment.user_endpoint}`);
  }

  // This method is used to call the endpoint that checks if the user has 2FA active
  isTfaActive(temp: string){
    return this.http.get<boolean>(`${environment.root_url}${environment.tfaisactive_endpoint}`, {headers: {'Authorization': `Bearer ${temp}`}})
  }

  // This method is used to send a post request to the endpoint that is used to setup 2FA
  setupTfa(temp: string){
    return this.http.post<TfaResponseModel>(`${environment.root_url}${environment.tfasetup_endpoint}`, {}, {headers: {'Authorization': `Bearer ${temp}`}})
  }

  // This method is used to send a post request to validate a 2FA code
  validateTfa(code: string, temp: string){
    return this.http.post<Tokens>(`${environment.root_url}${environment.tfaverify_endpoint}`, {code: code}, {headers: {'Authorization': `Bearer ${temp}`}})
  }

  // This method is used to get new session/refresh tokens
  getNewSession(refreshToken: string, oldToken: string){
    return this.http.post<Tokens>(`${environment.root_url}${environment.reftoken_endpoint}`, {sessionToken: oldToken, refreshToken: refreshToken})
  }

  // This method is used to get the users password entries
  getPasswords(): Observable<PasswordInfo[]>{
    const key = sessionStorage.getItem('key')
    if (key == null){
      return new Observable<PasswordInfo[]>;
    }
    return this.http.get<PasswordInfo[]>(`${environment.root_url}${environment.getpasswords_endpoint}`).pipe(tap(x => {
      // This iterates each password entry and decrypts its data and assigns the decrypted data to the relevant fields
      x.forEach(z => {
        const decrypted = this.enc.decryptPassword(key, z)
        z.password = decrypted.password,
        z.title = decrypted.title,
        z.username = decrypted.username,
        z.notes = decrypted.notes ?? undefined
      });
    }));
  }

  // This method is used to get a specific password based on its GUID identifier.
  getPassword(guid: string): Observable<PasswordInfo>{
    const key = sessionStorage.getItem('key')
    if (key == null){
      return new Observable<PasswordInfo>;
    }
    return this.http.get<PasswordInfo>(`${environment.root_url}${environment.passwordgetbyid_endpoint}`.replace('{passwordGuid}',guid)).pipe(tap(x => {
      // This decrypts the password entry returned from the server and assigns the relevant decrypted data
      const decrypted = this.enc.decryptPassword(key, x);
      x.password = decrypted.password;
      x.title = decrypted.title;
      x.username = decrypted.username;
      x.notes = decrypted.notes != null ? decrypted.notes : undefined;
      return x;
    }));
  }


  // This method is used to send a request to add a password entry.
  addPassword(pw: PasswordInfo): Observable<PasswordInfo>{
    const key = sessionStorage.getItem('key');
    if (key == undefined){
      return of(pw);
    }
    return this.http.post<PasswordInfo>(`${environment.root_url}${environment.passwordadd_endpoint}`, this.enc.encryptPassword(key, pw)).pipe(map(x => {
      // this decrypts the returned data
      x = this.enc.decryptPassword(key, x);
      return x;
    }));
  }

  // This method is used to call the endpoint to update an existing password entry
  updatePassword(pw: PasswordInfo): Observable<PasswordInfo>{
    const key = sessionStorage.getItem('key');
    if (key == undefined){
      return of(pw);
    }
    // This will encrypt the data being sent to the server and will then decrypt the response
    return this.http.put<PasswordInfo>(`${environment.root_url}${environment.passwordupdate_endpoint}`, this.enc.encryptPassword(key, pw)).pipe(map(x => {
      x = this.enc.decryptPassword(key, x);
      return x;
    })) ;
  }

  // This method is used to call the endpoint to delete a password entry based on its GUID.
  deletePassword(pwGuid: string): Observable<boolean>{
    return this.http.delete<boolean>(`${environment.root_url}${environment.passwordremove_endpoint}`.replace('{passwordGuid}', pwGuid));
  }
}
