import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePageComponent } from './home-page/home-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { AdminPageComponent } from './admin/admin-page/admin-page.component';
import { ContentPageComponent } from './admin/content-page/content-page.component';
import { MediaLibraryComponent } from './admin/media-library/media-library.component';
import { SettingsComponent } from './admin/settings/settings.component';
import { UserManagerComponent } from './admin/user-manager/user-manager.component';
import { AppearanceComponent } from './admin/appearance/appearance.component';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent
  },
  {
    path: 'login',
    component: LoginPageComponent
  },
  {
    path: 'admin',
    component: AdminPageComponent,
    children: [
      {
        path: 'pages',
        component: ContentPageComponent
      },
      {
        path: 'media',
        component: MediaLibraryComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'users',
        component: UserManagerComponent
      },
      {
        path: 'appearance',
        component: AppearanceComponent
      }
    ]
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
