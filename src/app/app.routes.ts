import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { WithdrawalAnimationComponent } from './pages/withdrawal-animation/withdrawal-animation.component';

export const routes: Routes = [
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }, // Ruta protegida
    { path: 'login', component: LoginComponent },
    { path: 'withdrawal-animation', component: WithdrawalAnimationComponent, canActivate: [authGuard] }, // Ruta protegida
    { path: '**', redirectTo: 'login' }
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }