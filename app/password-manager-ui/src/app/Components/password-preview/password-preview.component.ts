import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { tap } from 'rxjs';
import { RequestsService } from 'src/app/Services/requests.service';
import { PasswordInfo } from 'src/app/models/password-info.model';

@Component({
  selector: 'app-password-preview',
  templateUrl: './password-preview.component.html',
  styleUrls: ['./password-preview.component.scss']
})
export class PasswordPreviewComponent implements OnInit, OnChanges {

  @Input() activeItem?: PasswordInfo;
  constructor(private cd: ChangeDetectorRef, private req: RequestsService){}

  public pwVisibility = false;
  public isLoading = false;

  // define form for the password entries
  public passwordPreview = new FormGroup({
    siteName: new FormControl(`${this.activeItem ?? ''}`, { validators: [Validators.required] }),
    username: new FormControl('', { validators: [Validators.required] }),
    password: new FormControl('', { validators: [Validators.required] }),
    notes: new FormControl('', { })
  })

  ngOnInit(): void {
    this.passwordPreview.setValue({
      siteName: (this.activeItem?.title ?? ''),
      username: (this.activeItem?.username ?? ''),
      password: (this.activeItem?.password ?? ''),
      notes: (this.activeItem?.notes ?? '')
    })
    this.cd.detectChanges();
  }

  // This sets data when changes are detected
  ngOnChanges(changes: SimpleChanges): void {
      if (changes['activeItem'] != null){
        this.pwVisibility = false;
        this.passwordPreview.setValue({
          siteName: (this.activeItem?.title ?? ''),
          username: (this.activeItem?.username ?? ''),
          password: (this.activeItem?.password ?? ''),
          notes: (this.activeItem?.notes ?? '')
        })
      }
  }

  toggleVisibility(){
    this.pwVisibility = !this.pwVisibility;
  }

  cancel(){
    this.activeItem = undefined;
  }

  // This saves the password entry
  save(){
    if (this.activeItem == null){
      return;
    }
    this.isLoading = true;

    this.activeItem.username = this.passwordPreview.get('username')?.value ?? this.activeItem?.username
    this.activeItem.password = this.passwordPreview.get('password')?.value ?? this.activeItem?.username
    this.activeItem.title = this.passwordPreview.get('siteName')?.value ?? this.activeItem?.username
    this.activeItem.notes = this.passwordPreview.get('notes')?.value ?? this.activeItem?.notes

    this.req.updatePassword(this.activeItem)?.pipe(tap(x => {
      this.activeItem!.password = x.password;
      this.activeItem!.username = x.username;
      this.activeItem!.title = x.title;
      this.activeItem!.notes = x.notes ?? undefined;
      this.isLoading = false;
    })).subscribe();
  }

}
