import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PasswordGeneratorService } from 'src/app/Services/password-generator.service';
import {Clipboard} from '@angular/cdk/clipboard';
@Component({
  selector: 'app-generate-password',
  templateUrl: './generate-password.component.html',
  styleUrls: ['./generate-password.component.scss']
})
export class GeneratePasswordComponent {

  public generatedPw = "";
  public justCopied = false;
  @Output() outGenPasswordLen = new EventEmitter<number>();
  public genPw = new FormGroup({
    len: new FormControl(12, { validators: [] }),
  })

  constructor(private gs: PasswordGeneratorService, private clipboard: Clipboard){

  }

  // This will output the password length to the parent component
  outPwLen(event: string){
    const num = Number.parseInt(event);
    this.outGenPasswordLen.emit(num);
  }

  // This will generate a random password using the password generate service
  submit(){
    const len = this.genPw.get('len')?.value as number;
    this.generatedPw = this.gs.generatePassword(len);
  }

  // This will copy the generated password to the users clipboard
  copyPw(){
    this.clipboard.copy(this.generatedPw);
    this.justCopied = true;
    // This just delays the button reset so the user can see the password has been copied
    setTimeout(() => {
      this.justCopied = false;
    }, 300)
  }
}
