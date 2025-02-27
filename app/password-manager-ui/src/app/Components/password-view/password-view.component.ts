import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { constrainedMemory } from 'process';
import { first, map, switchMap, tap } from 'rxjs';
import { PasswordGeneratorService } from 'src/app/Services/password-generator.service';
import { RequestsService } from 'src/app/Services/requests.service';
import { PasswordInfo } from 'src/app/models/password-info.model';

@Component({
  selector: 'app-password-view',
  templateUrl: './password-view.component.html',
  styleUrls: ['./password-view.component.scss']
})
export class PasswordViewComponent implements OnInit {

  public isNew = false;
  public activeItem?: PasswordInfo = new PasswordInfo();
  public pwVisibility = false;
  public isLoading = false;
  public generatePasswordLength = 12;
  public passwordPreview = new FormGroup({
    siteName: new FormControl('', { validators: [Validators.required] }),
    username: new FormControl('', { validators: [Validators.required] }),
    password: new FormControl('', { validators: [Validators.required] }),
    notes: new FormControl('', {})
  })
  guid?: string;

  constructor(private r: ActivatedRoute, private req: RequestsService, private router: Router, private generator: PasswordGeneratorService) {
  }

  // This gathers the password data for the one specified
  setupPw(){
    if (this.guid == null) {
      this.isNew = true;
    } else {
      this.isLoading = true;
      this.req.getPassword(this.guid!).pipe(tap(x => {
        this.activeItem = x;
        this.passwordPreview.setValue({
          siteName: (this.activeItem.title ?? ''),
          password: (this.activeItem.password ?? ''),
          username: (this.activeItem.username ?? ''),
          notes: (this.activeItem.notes ?? '')
        });
        this.isLoading = false;
      })).subscribe();
    }
  }

  outGenPwLen(len: number){
    this.generatePasswordLength = len;
  }

  ngOnInit(): void {
    // This assigns the guid passed within the parameters of the path
    this.r.paramMap.pipe(tap(params => {
      this.guid = (params.get('guid') != null ? String(params.get('guid')) : undefined);
      this.setupPw();
    }), first()).subscribe();
  }

  // This toggles whether the password input form is visible or not
  toggleVisibility() {
    this.pwVisibility = !this.pwVisibility;
  }

  cancel(){
    this.router.navigate(['/passwords']);
  }

  // This generates a password
  quickGenerate(){
    this.passwordPreview.setValue({
      siteName: (this.passwordPreview.get('siteName')?.value ?? this.activeItem!.title),
      password: (this.generator.generatePassword(this.generatePasswordLength) ?? this.activeItem!.password),
      username: (this.passwordPreview.get('username')?.value ?? this.activeItem!.username),
      notes: (this.passwordPreview.get('notes')?.value ?? (this.activeItem!.notes ?? ''))
    })
  }

  // This is used to save the form. It will add the password if no password guid has been specified otherwise it'll update the password
  save() {
    if (this.activeItem == null || !this.passwordPreview.valid) {
      return;
    }
    this.isLoading = true;

    this.activeItem.username = this.passwordPreview.get('username')?.value ?? this.activeItem?.username
    this.activeItem.password = this.passwordPreview.get('password')?.value ?? this.activeItem?.username
    this.activeItem.title = this.passwordPreview.get('siteName')?.value ?? this.activeItem?.username
    this.activeItem.notes = this.passwordPreview.get('notes')?.value ?? this.activeItem?.notes
    if (this.isNew) {
      this.req.addPassword(this.activeItem)?.pipe(tap(x => {
        this.activeItem!.password = x.password;
        this.activeItem!.username = x.username;
        this.activeItem!.title = x.title;
        this.activeItem!.notes = x.notes ?? undefined;
        this.activeItem = x;
        this.guid = x.passwordGuid;
        this.isNew = false;
        this.isLoading = false;
      })).subscribe();
    }else{
      this.req.updatePassword(this.activeItem)?.pipe(tap(x => {
        this.activeItem!.password = x.password;
        this.activeItem!.username = x.username;
        this.activeItem!.title = x.title;
        this.activeItem!.notes = x.notes ?? undefined;
        this.isLoading = false;
      })).subscribe();
    }
  }

}
