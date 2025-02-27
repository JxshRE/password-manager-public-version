import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { AuthprotectionService, canActivateGuard, canActivateTfaGuard } from './Services/authprotection.service';
import { PasswordsComponent } from './Components/passwords/passwords.component';
import { PasswordViewComponent } from './Components/password-view/password-view.component';
import { RegistrationPageComponent } from './Components/registration-page/registration-page.component';
import { TwoStepViewComponent } from './Components/two-step-view/two-step-view.component';
import { PasswordGeneratorViewComponent } from './Components/password-generator-view/password-generator-view.component';

const routes: Routes = [
  {path: '', component: HomeComponent },
  {path: 'login', component: HomeComponent },
  {path: 'register', component: RegistrationPageComponent},
  {path: '2fa', component: TwoStepViewComponent, canActivate: [canActivateTfaGuard]},
  {path: 'passwords', component: PasswordsComponent, canActivate: [canActivateGuard]},
  {path: 'generate', component: PasswordGeneratorViewComponent, canActivate: [canActivateGuard]},
  {path: 'view', component: PasswordViewComponent, canActivate:[canActivateGuard]},
  {path: 'view/:guid', component: PasswordViewComponent, canActivate: [canActivateGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  
}
