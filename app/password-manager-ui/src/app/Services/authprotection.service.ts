import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

// This is used to protect paths that require a user session
export class AuthprotectionService{

  constructor(private auth: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean{
    // This will check if the session is expired so it can get a new one if so using the refresh token
    this.auth.checkRefreshRedirect(route.url.toString());
    
    // This returns true if the user is authenticated
    if (this.auth.isAuthed()){
      return true;
    }
    // Otherwise it will redirect them to login and return false
    this.router.navigate(['/login'])
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
// This class is used to protect the 2FA endpoint where the user would enter their 2FA code
export class TfaAuthProtectionService{
  constructor(private auth: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean{
    // This checks that the user has a temporary 2fa token, if so it will allow them to go to the path specified
    // Otherwise it will redirect them back to login
    if (this.auth.hasTempToken()){
      return true;
    }
    this.router.navigate(['/login'])
    return false;
  }
}

// These are used to inject the guards for the endpoints protected by session and 2fa tokens
export const canActivateGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return inject(AuthprotectionService).canActivate(route);
}

export const canActivateTfaGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return inject(TfaAuthProtectionService).canActivate(route);
}

@Injectable()
// This interceptor is used to add the users session token into all requests it makes to the API
// This is neccessary to allow for the API to authenticate and check that the user making the request is valid
export class HeaderAdd implements HttpInterceptor{
  constructor(private auth: AuthService){}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    if (token){
      req = req.clone({
        setHeaders:{
          'Authorization': `Bearer ${token}`
        }
      })
    }
    return next.handle(req);
  }
}