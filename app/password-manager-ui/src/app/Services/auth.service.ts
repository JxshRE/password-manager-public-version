import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { Tokens } from '../models/tokens.model';
import { EncryptionService } from './encryption.service';
import { Router } from '@angular/router';
import { RequestsService } from './requests.service';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private es: EncryptionService, private router: Router, private req: RequestsService) { }
  public jwt: JwtHelperService = new JwtHelperService();

  // This checks if they have a 2fa token
  hasTempToken(){
    const session = sessionStorage.getItem('temp');
    return !this.jwt.isTokenExpired(session);
  }

  // This checks their session token to see if it's expired and if so it will get a new one based on the refresh token by calling the API
  // It will then assign this new session token and redirect them back to their initial destination.
  checkRefreshRedirect(toDirect: string){

    if (sessionStorage.getItem('session')){
      if (!this.jwt.isTokenExpired(sessionStorage.getItem('session'))){
        return;
      }
    }

    if (!sessionStorage.getItem('key')){
      this.logout();
    }

    if (localStorage.getItem("refresh") && localStorage.getItem('session-ref')){
      const ref = localStorage.getItem('refresh') as string
      const refSes = localStorage.getItem('session-ref') as string
      this.req.getNewSession(ref, refSes).pipe(tap(x => {
        sessionStorage.setItem("session", x.sessionToken);
        localStorage.setItem("session-ref", x.sessionToken);
        localStorage.setItem("refresh", x.refreshToken!);
        this.router.navigate([toDirect]);
      })).subscribe();
    }else{
      this.router.navigate(['/login']);
    }
  }

  // This is used to route them back to the main index/home page
  routeOut(){
    this.router.navigate(['/']);
  }

  // This is used to route the user to view their password entries
  routeUser(){
    this.router.navigate(['/passwords']);
  }

  // This is used to call the API to login a user and sets the 2fa token as well as their encryption key into session storage
  async makeLogin(email: string, password: string): Promise<Observable<boolean>>{

    const toStore = await this.es.getStoredKey(email, password);
    const encKey = this.es.getEncryptionKey(email, password);
    return await this.req.makeLoginRequest(email, toStore).pipe(map(x => {
      const session = x.sessionToken;
      sessionStorage.setItem("temp", session);
      sessionStorage.setItem("key", encKey);
      this.router.navigate(['/2fa']);
      return true;
    }), catchError(err => {
      return of(false);
    }));
  }

  // This checks to see if the user has 2fa setup
  tfaIsActive(){
    const temp = sessionStorage.getItem('temp')

    return this.req.isTfaActive(temp!);
  }

  // This is used to call the endpoint to setup 2fa for the user
  setupTfa(){
    const temp = sessionStorage.getItem('temp');

    return this.req.setupTfa(temp!);
  }

  // This is used to validate the users 2fa code so they can be authenticated
  async make2Step(code: string): Promise<Observable<boolean>>{

    const temp = sessionStorage.getItem('temp')
    return await this.req.validateTfa(code, temp!).pipe(map(x => {
      const session = x.sessionToken;
      const ref = x.refreshToken;
      sessionStorage.setItem("session", session);
      localStorage.setItem("session-ref", session);
      localStorage.setItem("refresh", ref!);
      sessionStorage.removeItem('temp');
      this.routeUser();
      return true;
    }), catchError(err => {
      return of(false);
    }));
  }

  // This method is used to call the registration endpoint to create a new user.
  // It gets the encryption key to encrypt/decrypt their data as well as their stored key that's stored on the db for authentication
  async makeRegister(email: string, password: string): Promise<Observable<boolean>>{
    const toStore = await this.es.getStoredKey(email, password);
    const encKey = this.es.getEncryptionKey(email, password);
    return await this.req.makeRegisterRequest(email, toStore).pipe(map(x => {
      const session = x.sessionToken;
      sessionStorage.setItem("temp", session);
      sessionStorage.setItem("key", encKey);
      this.router.navigate(['/2fa']);
      return true;
    }), catchError(err => {
      return of(false);
    }));
  }

  // This is used to check if the users session token is still valid
  public isAuthed(){
    const session = sessionStorage.getItem('session');
    return !this.jwt.isTokenExpired(session);
  }

  // This is used to log the user out of their account by removing all the data stored on their browser
  public logout(){
    sessionStorage.removeItem('session');
    localStorage.removeItem('session-ref');
    localStorage.removeItem('refresh');
    sessionStorage.removeItem('key');
    localStorage.clear();
    sessionStorage.clear();
    this.routeOut();
  }

  // This is used to get the users session token from session storage
  public getToken(): string{
    return sessionStorage.getItem('session') as string;
  }
}

