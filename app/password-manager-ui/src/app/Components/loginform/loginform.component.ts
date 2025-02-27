import { ChangeDetectorRef, Component, Input, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, first, firstValueFrom, map, of, race, switchMap, take, tap, timer } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { EncryptionService } from 'src/app/Services/encryption.service';
import { RequestsService } from 'src/app/Services/requests.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './loginform.component.html',
  styleUrls: ['./loginform.component.scss'],
})
export class LoginformComponent implements OnInit {

  @Input() isRegistering = false;

  public failedLogin = false;
  public isSubmitting = false;
  public showPassword = false;

  constructor(private es: EncryptionService, private req: RequestsService, private auth: AuthService, private ngZone: NgZone) {

  }

  public loginForm = new FormGroup({
    email: new FormControl('', { validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { validators: [Validators.required] })
  })

  get email() {
    return this.loginForm.get('email');
  }
  get password() {
    return this.loginForm.get('password');
  }

  ngOnInit(): void {
    if (this.isRegistering) {
      // This sets the password validation regex
      this.loginForm.get('password')?.setValidators([Validators.required, Validators.pattern(`^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!#£$%^&*~@:?><{}()"]).{8,}$`)])
    }
  }

  // This toggles the visibility of the password input field
  toggleVisibility() {
    this.showPassword = !this.showPassword;
  }

  // This is used to check that the password matches the regex pattern
  checkPassword(password: string) {
    // This pattern checks for:
    // at least 8 characters,
    // at least 1 number,
    // at least 1 lower case character, 
    // at least 1 upper case character and atleast 1 special character

    if (password.match(`^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!#£$%^&*~@:?><{}()"]).{8,}$`)) {
      return true;
    }
    return false;
  }

  // This calls the login endpoint through the auth service
  async sendLogin(email: string, password: string): Promise<Observable<boolean>> {
    return (this.auth.makeLogin(email, password)).then(res => {
      return res.pipe(tap(x => {
        this.isSubmitting = false;
        if (!x) {
          this.failedLogin = true;
        }
        return of(true);
      }), first())
    });
  }

  // This is called when the user submits their login 
  async submit() {
    this.isSubmitting = true;
    if (!this.loginForm.valid) {
      this.failedLogin = true;
      this.isSubmitting = false;
      return;
    }
    const email = this.loginForm.get('email')?.value as string;
    const password = this.loginForm.get('password')?.value as string;


    (await this.callAuth(email, password)).subscribe();

  }

  // This is used to call for the login process to authenticate a user
  async callAuth(email: string, password: string) {
    return (await this.sendLogin(email, password));
  }

  // This will register a new user by getting the relevant info from the form and will then call the relevant methods to handle the registration.
  async register() {
    this.isSubmitting = true;
    if (!this.loginForm.valid) {
      this.failedLogin = true;
      return;
    }
    const email = this.loginForm.get('email')?.value as string;
    const password = this.loginForm.get('password')?.value as string;

    if (!this.checkPassword(password)) {
      this.failedLogin = true;
      return;
    }

    this.auth.makeRegister(email, password).then(x => {
      x.pipe(tap(z => {
        this.isSubmitting = false;
        if (!z) {
          this.failedLogin = true;
        }
        return of(true);
      })).subscribe();
    })

  }

}
