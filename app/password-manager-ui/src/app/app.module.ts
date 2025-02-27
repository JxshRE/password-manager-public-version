import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './Components/home/home.component';
import { RouterModule, provideRouter } from '@angular/router';
import { NavBarComponent } from './Components/nav-bar/nav-bar.component';
import { LoginformComponent } from './Components/loginform/loginform.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthprotectionService, HeaderAdd, TfaAuthProtectionService, canActivateGuard } from './Services/authprotection.service';
import { PasswordsComponent } from './Components/passwords/passwords.component';
import { PasswordGridComponent } from './Components/password-grid/password-grid.component';
import { PasswordItemComponent } from './Components/password-item/password-item.component';
import { PasswordPreviewComponent } from './Components/password-preview/password-preview.component';
import { PasswordViewComponent } from './Components/password-view/password-view.component';
import { GeneratePasswordComponent } from './Components/generate-password/generate-password.component';
import { RegistrationPageComponent } from './Components/registration-page/registration-page.component';
import { LoadingOverlayComponent } from './Components/loading-overlay/loading-overlay.component';
import { TwoStepViewComponent } from './Components/two-step-view/two-step-view.component';
import { PasswordGeneratorViewComponent } from './Components/password-generator-view/password-generator-view.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavBarComponent,
    LoginformComponent,
    PasswordsComponent,
    PasswordGridComponent,
    PasswordItemComponent,
    PasswordPreviewComponent,
    PasswordViewComponent,
    GeneratePasswordComponent,
    RegistrationPageComponent,
    LoadingOverlayComponent,
    TwoStepViewComponent,
    PasswordGeneratorViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS, useClass: HeaderAdd, multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
