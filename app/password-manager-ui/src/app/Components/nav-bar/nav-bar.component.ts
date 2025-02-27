import { AfterViewInit, ChangeDetectorRef, Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription, first, last, map, switchMap, take, takeLast, tap } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { PasswordGeneratorService } from 'src/app/Services/password-generator.service';
import { RequestsService } from 'src/app/Services/requests.service';
import { UserModel } from 'src/app/models/user.model';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit{
  public isAuthed = false;
  public user?: UserModel;
  public username = '';
  public calledUser = false;
  public getUserReqSub$?: Subscription;
  

  constructor(private auth: AuthService, private req: RequestsService, private router: Router, private ps: PasswordGeneratorService){}

  // This gets the user data to assign their username to the navigation sidebar
  getUser(){
   this.getUserReqSub$ = this.req.getUser().pipe(map(x => {
      if (x != null){
        this.user = x;
        this.username = x.username;
      }
      this.calledUser = false;
    }), first()).subscribe();
  }

  ngOnInit(): void {
    this.router.events.pipe(map(e => {
      this.isAuthed = this.auth.isAuthed();
      // Call to get user data if they're authenticated
      if (this.isAuthed && this.user === undefined && !this.calledUser){
        this.calledUser = true;
        this.getUser();
      }
    }), takeLast(1)).subscribe();
  }

  // This is used to logout the user
  public logout(){
    this.calledUser = false;
    this.user = undefined;
    this.auth.logout();
  }
}
