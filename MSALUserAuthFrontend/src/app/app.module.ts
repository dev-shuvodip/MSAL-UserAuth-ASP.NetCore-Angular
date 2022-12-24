import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import {
  MsalGuard,
  MsalInterceptor,
  MsalModule
} from '@azure/msal-angular';
import {
  InteractionType,
  PublicClientApplication
} from '@azure/msal-browser';
import { environment } from 'src/environments/environment';
import { MaterialModule } from './material/material.module';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule
} from '@angular/common/http';

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 ||
  window.navigator.userAgent.indexOf('Trident/') > -1; // Set to true for Internet Explorer 11

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    MaterialModule,
    BrowserAnimationsModule,
    MsalModule.forRoot(new PublicClientApplication({
      auth: {
        clientId: environment.Application_Id, // Application (client) ID from the app registration
        authority: environment.Cloud_Instance_Id + environment.Tenant_Info, // The Azure cloud instance and the app's sign-in audience (tenant ID, common, organizations, or consumers)
        redirectUri: environment.Redirect_Uri// This is your redirect URI
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: isIE, // Set to true for Internet Explorer 11
        secureCookies: true
      }
    }), {
      interactionType: InteractionType.Popup, // MSAL Guard Configuration
      authRequest: {
        scopes: ['user.read']
      }
    }, {
      interactionType: InteractionType.Popup, // MSAL Interceptor Configuration
      protectedResourceMap: new Map([
        ['https://graph.microsoft.com/v1.0/me', ['user.read']]
      ])
    })
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS, // MSAL Interceptor added as provider here
    useClass: MsalInterceptor,
    multi: true
  },
    MsalGuard // MsalGuard added as provider here
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
