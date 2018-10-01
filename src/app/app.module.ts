import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Module with angular material and flex layout components
import { MaterialModule } from './material.module';

// AngularFire modules
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';

// Services for initialization
import { AppConfigService, IAppConfig, FirebaseConfig } from './app-config.service';
import { PluginLoaderService, ParagraphComponent, SpanComponent } from './plugin-loader.service';

// Base pages and components
import { HomePageComponent } from './home-page/home-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

// Admin pages and components
import { NavBarComponent } from './admin/nav-bar/nav-bar.component';
import { SideBarComponent } from './admin/side-bar/side-bar.component';
import { ContentPageComponent } from './admin/content-page/content-page.component';
import { AdminPageComponent } from './admin/admin-page/admin-page.component';
import { MediaLibraryComponent } from './admin/media-library/media-library.component';
import { SettingsComponent } from './admin/settings/settings.component';
import { UserManagerComponent } from './admin/user-manager/user-manager.component';
import { AppearanceComponent } from './admin/appearance/appearance.component';

declare var sparkPressConfig: IAppConfig;

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    NavBarComponent,
    SideBarComponent,
    LoginPageComponent,
    ContentPageComponent,
    AdminPageComponent,
    PageNotFoundComponent,
    MediaLibraryComponent,
    SettingsComponent,
    UserManagerComponent,
    AppearanceComponent,
    ParagraphComponent,
    SpanComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    AngularFireModule.initializeApp(sparkPressConfig.env.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule
  ],
  providers: [
    AppConfigService,
    PluginLoaderService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
