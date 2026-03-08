import { Routes } from '@angular/router';
import { Login } from './core/auth/components/login/login';
import { Register } from './core/auth/components/register/register';
import { authguardGuard } from './core/guards/authguard-guard';
import { feedguardGuard } from './core/guards/feedguard-guard';
import { MainLayout } from './core/layouts/main-layout/main-layout';
import { ChangePassword } from './features/change-password/change-password';
import { Feed } from './features/feed/feed';
import { NotFound } from './features/not-found/not-found';
import { PostDetails } from './features/post-details/post-details';
import { Profile } from './features/profile/profile';
import { Notifications } from './features/notifications/notifications';


export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    canActivate: [authguardGuard],
    children: [
      { path: 'feed', component: Feed, title: 'feed page' },
      { path: 'profile', component: Profile, title: 'profile page' },
      { path: 'notifications', component: Notifications, title: 'notifications page' },
      { path: 'changepassword', component: ChangePassword, title: 'change password' },
      { path: 'post-details/:id', component: PostDetails, title: 'post details page' },
      { path: '', redirectTo: 'feed', pathMatch: 'full' },
    ],
  },
  { path: 'login', component: Login, title: 'login page', canActivate: [feedguardGuard] },
  { path: 'signup', component: Register, title: 'signup page', canActivate: [feedguardGuard] },
  { path: '**', component: NotFound, title: 'not found' },

];