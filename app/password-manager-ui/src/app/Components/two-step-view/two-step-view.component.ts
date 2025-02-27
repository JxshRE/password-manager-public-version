import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { RequestsService } from 'src/app/Services/requests.service';

@Component({
  selector: 'app-two-step-view',
  templateUrl: './two-step-view.component.html',
  styleUrls: ['./two-step-view.component.scss']
})
export class TwoStepViewComponent implements OnInit {

  public qrCodeUrl: string = '';
  public manualCode: string = '';
  public form = new FormGroup({
    code: new FormControl('')
  });

  public isLoading = true;

  public isSetup = false;
  public codeFailed = false;

  constructor(private req: RequestsService, private auth: AuthService, private router: Router){

  }

  // Used to setup the users 2fa, this will be used to display the qr code and the manual entry code on the page
  setup2fa(){
    this.isSetup = true;
    this.auth.setupTfa().pipe(map(x => {
      this.qrCodeUrl = x.qrImgUrl;
      this.manualCode = x.manualCode;
      this.isLoading = false;
    })).subscribe();
  }

  ngOnInit(): void {
    // This checks to see if 2fa is active for the user, otherwise it needs to be setup and call a different endpoint
    this.auth.tfaIsActive().pipe(map(x => {
      if (!x){
        this.setup2fa();
      }else{
        this.isLoading = false;
      }
    })).subscribe();
      
  }

  // This method handles the submission of the one time code the user gets from their authenticator app
  async onSubmit(){

    const code = this.form.get('code')?.value ?? undefined;
    if (code == null || !this.form.valid){
      return;
    }

    (await this.auth.make2Step(code)).pipe(map(x => {
      if (!x){
        this.codeFailed = true;
      }
    })).subscribe();
  }

}
