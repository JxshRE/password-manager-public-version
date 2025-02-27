import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './Services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'password-manager-ui';
  public isAuthed = false;
  constructor(private auth: AuthService){}

  ngOnInit(): void {
      this.isAuthed = this.auth.isAuthed();
  }

}
