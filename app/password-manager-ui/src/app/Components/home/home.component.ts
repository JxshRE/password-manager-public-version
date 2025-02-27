import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private auth: AuthService){}

  ngOnInit(): void {
      if (this.auth.isAuthed()){
        this.auth.routeUser(); // This routes the user to their passwords if they're authenticated already
      }
  }
}
