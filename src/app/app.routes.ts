import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }, // Ruta protegida
    { path: 'login', component: LoginComponent },
    { path: '**', redirectTo: 'login' }
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }