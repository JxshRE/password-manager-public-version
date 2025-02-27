import { Component } from '@angular/core';
import { PasswordInfo } from 'src/app/models/password-info.model';

@Component({
  selector: 'app-passwords',
  templateUrl: './passwords.component.html',
  styleUrls: ['./passwords.component.scss']
})
export class PasswordsComponent {

  public activeItem?: PasswordInfo;

  prevPassword(event: PasswordInfo){
      this.activeItem = event;
  }


}
