import {
  Component,
  OnDestroy,
  OnInit,
  Inject
} from '@angular/core';
import {
  MsalBroadcastService,
  MsalGuardConfiguration,
  MsalService,
  MSAL_GUARD_CONFIG
} from '@azure/msal-angular';
import { InteractionStatus, PopupRequest } from '@azure/msal-browser';
import {
  filter,
  Subject,
  takeUntil
} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'User Authentication in Angular SPA with ASP.Net Core Backend using MSAL.js 2.0 with auth code flow';
  isIframe = false;
  loginDisplay = false;
  private readonly _destroying$ = new Subject<void>();

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private broadcastService: MsalBroadcastService,
    private authService: MsalService
  ) { }

  ngOnInit() {
    this.isIframe = window !== window.parent && !window.opener;
    this.broadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
      })
  }

  /**
   * Login using popup
   */
  login() {
    if (this.msalGuardConfig.authRequest) {
      this.authService.loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
        .subscribe({
          next: (result) => {
            console.log(result);
            this.setLoginDisplay();
          },
          error: (error) => console.log(error)
        });
    } else {
      this.authService.loginPopup()
        .subscribe({
          next: (result) => {
            console.log(result);
            this.setLoginDisplay();
          },
          error: (error) => console.log(error)
        });
    }
  }

  /**
   * Logout using popup
   */
  logout() {
    this.authService.logoutPopup({
      mainWindowRedirectUri: "/"
    });
  }

  /**
   * Display after successful login
   */
  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
