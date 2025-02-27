import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { RequestsService } from 'src/app/Services/requests.service';
import { PasswordInfo } from 'src/app/models/password-info.model';

@Component({
  selector: 'app-password-grid',
  templateUrl: './password-grid.component.html',
  styleUrls: ['./password-grid.component.scss']
})
export class PasswordGridComponent implements OnInit {

  
  public filterQ = '';
  public passwords: PasswordInfo[] = []
  public activeCtx: string = '';
  public isLoading = false;
  public showDelConfirm = false;
  public guidToDel: string = '';
  
  public active?: PasswordInfo;

  @Output() outActivePw = new EventEmitter<PasswordInfo>();
  constructor(private req: RequestsService, private r: Router){

  }

  isCtx(event: string){
    this.activeCtx = event;
  }

  loadPasswords(){
    this.req.getPasswords().pipe(map(x  => {
      this.passwords = x;
      this.isLoading = false;
    })).subscribe();
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadPasswords();
  }

  // This sets the active password entry based on which one was clicked in the list
  setActivePw(id: string){

    this.active = this.passwords.find(x => x.passwordGuid == id);
    
    if (this.active?.passwordGuid !== this.activeCtx){
      this.outActivePw.emit(this.active);
      this.activeCtx = '';
    }else{
      this.activeCtx = '';
    }
  }

  // This is used to set the filter variable for filtering out passwords based on their name
  filter(event: any){
    this.filterQ = event.target.value;
  }

  // This is used to check if the specified password name has been filtered.
  isFiltered(name: string){
    if (this.filterQ.length < 2 && this.filterQ != ''){
      return true;
    }
    if (name.toLowerCase().includes(this.filterQ.toLowerCase())){
      return true;
    }
    return false;
  }

  // This redirects to a view that allows for a new password to be added using the form on the page
  new(){
    this.r.navigate(['/view'])
  }

  // This is used to cancel the deletion of a password entry
  canceldel(){
    this.guidToDel = '';
    this.showDelConfirm = false;
  }

  // This is used to toggle the confirmation for deleting a password
  delpw(id: string){
    this.guidToDel = id;
    this.showDelConfirm = true;
  }

  // This is used to confirm the deletion of a password entry
  delPwConfirmed(){
    this.req.deletePassword(this.guidToDel).pipe(tap(x => {
      if (x){
        this.outActivePw.emit(undefined);
        this.showDelConfirm = false;
        this.loadPasswords();
      }
    })).subscribe();
  }
}
