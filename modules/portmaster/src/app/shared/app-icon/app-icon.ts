import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { AppProfileService } from '../../services';

// Interface that must be satisfied for the profile-input
// of app-icon.
export interface IDandName {
  // ID of the profile.
  ID: string;
  // Name of the profile.
  Name: string;
}

// Some icons we don't want to show on the UI.
// Note that this works on a best effort basis and might
// start breaking with updates to the built-in icons...
const iconsToIngore = [
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABU0lEQVRYhe2WTUrEQBCF36i4ctm4FsdTKF5AEFxL0knuILgQXAy4ELxDfgTXguAFRG/hDXKCAbtcOB3aSVenMjPRTb5NvdCE97oq3QQYGflnJlbc3T/QXxrfXF9NAGBraKPTk2Nvtey4D1l8OUiIo8ODX/Xt/cMfQCk1SAAi8upWgLquWy8rpbB7+yk2m8+mYvNWAAB4fnlt9MX5WaP397ZhCPgygCFa1IUmwJifCgB5nrMBtdbhAK6pi9QcALIs8+5c1AEOqTmwZge4EUjNiQhpmjbarcvaG4AbgcTcUhSFfwFAHMfhABxScwBIkgRA9wnwBgiOQGBORCjLkl2PoigcgB2BwNzifmi97wEOqTkRoaoqdr2zA9wIJOYWrTW785VPQR+WO2B3vdYIpBBRc9Qkp2Cw/4GVR+BjPpt23u19tUXUgU2aBzuQPz5J8oyMjGyUb9+FOUOmulVPAAAAAElFTkSuQmCC",
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAACLElEQVR4nO2av07DMBDGP1DFxtaFmbeg6gtUqtQZtU3yDkgMSAxIDEi8Q/8gMVdC4m1YYO0TMNQspErdOG3Md25c7rc0st3E353v7EsLKIqiKIqiKMq/5MRueHx6NoeYSCjubm82NJ8eaiISdDtX6HauKq9tWsFmF4DPr6+d1zalBshG18RpNYfJy+tW21GFgA+lK6DdboeeBwVjyvO3qx1wGGC5XO71wCYZykc8QEqCZ/cfjNs4+X64rOz3FQ/sMMDi7R2Dfg+Lt/eN9kG/tzX24rwFA8AYYGXM+nr9aQADs9mG37FWW3HsqqBhMpnsFFRGkiTOvkoD5ELLBNtIiLcdmGXZ5jP/4Pkc2i4gIb5KRl3xrnbaQSiEeN8QGI/Hzj5aDgjh+SzLaJ7P4eWAiJZ9EVoIhBA/nU695uYdAnUI4fk0TUvbXeP3gZcDhMS7CLIL1DsHyIv3DYHRaOTs44YAZD2fpik9EfIOQohn2Rch5wBZ8bPZzOObfwiBurWAtOftoqaO511jaSEgJd4FQzwgmAQlxPuGwHA4dPbJ1QICnk+ShOb5HJlaoOHLvgi/FhAUP5/P9xpbteRtyDlA1vN2UVPH8+K7gJR45/MI4gHyK7HYxANsA7BuVvkcnniAXAtIwxYPRPTboIR4IBIDMMSL7wIhYZbF0RmgsS9EQtDY1+L5r7esCUrGvA3xHBCfeIBkgBjEi+0CMYsHHDmg7N9UiqIoiqIoiqIcFT++NKIXgDvowAAAAABJRU5ErkJggg==",
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAABqUlEQVRYhe2XP2rDMBSHfymhU0dDD5BbJOQCgUDmEv+7Q6FDoUOgQ6F3cJxC50Agt+nSrD5BBr8OqVyrtfWkl8ShoG+SjJE+/95DwoDH4/nf9NTg+eWVLinym8eH+x4AXF1i8/FoiPFoaBwr+p3bAfjc7dixQhNMw7szatmTvb1XY00wCILOZYjIONcEi6JoXSgIAlw/fYhF9ouBsxzQ0IPrzRaz6QTrzbZ6NptOqvHtTR8EQklAWQIl4WdOQEkEqsaHefm9b5Zl7IfEcWwWVDJ1Ke0rHeXqmaRpeljDIrlWQQ5XufreNglGUWQW5EoslQOAJEm0uagHuRJL5YgIy+Wycc06bIIcEjmFStCUnPGYASxKLJQDYJVgGIZmQZsSS+SAv0eIKblWQQ6pHBEhz3N2fTZBrsQSOYVK0JQc24N2JXaXA2CV4Hw+NwtySOUA/QixvU1kPSiQIyKsViv2vaMTlMgpoihik2N7kEMqB6AxwXpiVlfduSAi7Qix7cGL/DS5XHWdC7rIAY4l3i8GTk1+zLsKpwS7lnMS7ErOeMzU/0c9Ho/nNHwBdUH2gB9vJRsAAAAASUVORK5CYII=",
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAByElEQVRYhe1WQUoDQRCsmSh4CAreo3/w4CdE8JirLzCKGhRERPBqfISQx3j0BcaDJxHNRWS7PWRmtmdmJ9mNiSuYOmyYbOiqruoeAizw36G6p0e3WulOHeTE1NO/Qb6zu1f4qZXuqLPuMV9d38xbQyEuL86ha2EWWJKHfr+P4XAIAGg2m2i32wCA7fsXPH9kABjMgHkADP87cW6tNvCwvzG2biRAvpAYvH+54mCAmUcvmI0Yq4nM74DBG02sGwlIgqigS/ZEgdkcrSAuVbpUBEyjTiP7JSkDzKZrdo+xdSMBKas4y4K8befSiVxcLnR83UhACtYBV9TOgbBbOX4TF2YZQZY5Yi9/MYwkXQjy/3EEtjp7LgQzAeOUVSo0zCACcgOnwjUEC2LE7kxApS0AGFRgP4vZ8M5VBaQjoNGKuQ20Q2ney8Gr0H0kIAU7hK4zYiPCJxtFZYRMIyAdAQWrFgyicMSfj4oCkheRmQFyIoq2IRcy9T2QhNmCfN/FVcwMBSWu4XlsQUZe5tZmZW0HBXGU4o4FpCJorS3j6fXTEOVdUrgNApvrK9UFpPB4vlWq2DSo/S+Z6p4c9rRuHNRBTsR3dfAu8LfwDdGgu25Uax8RAAAAAElFTkSuQmCC",
]

@Component({
  selector: 'app-icon',
  templateUrl: './app-icon.html',
  styleUrls: ['./app-icon.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppIconComponent {
  /** @private The data-URL for the app-icon if available */
  src: string = '';

  /** The profile for which to show the app-icon */
  @Input()
  set profile(p: IDandName | null | undefined) {
    this._profile = p || null;
    this.updateView();
  }
  get profile() { return this._profile; }
  private _profile: IDandName | null = null;

  /** If not icon is available, this holds the first - uppercased - letter of the app - name */
  letter: string = '';

  /** @private The background color of the component, based on icon availability and generated by ID */
  @HostBinding('style.background-color')
  get color() {
    if (!!this.src) {
      return 'unset';
    }
    return this._color;
  }
  private _color: string = 'var(--text-tertiary)';

  constructor(
    private profileService: AppProfileService,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  /** Updates the view of the app-icon and tries to find the actual application icon */
  private updateView() {
    const p = this.profile;
    if (!!p) {
      this.tryGetSystemIcon(p);

      let idx = 0;
      for (let i = 0; i < p.ID.length; i++) {
        idx += p.ID.charCodeAt(i);
      }

      if (p.Name !== "") {
        if (p.Name[0] === '<') {
          // we might get the name with search-highlighting which
          // will then include <em> tags. If the first character is a <
          // make sure to strip all HTML tags before getting [0].
          this.letter = p.Name.replace(/(&nbsp;|<([^>]+)>)/ig, "")[0].toLocaleUpperCase();
        } else {
          this.letter = p.Name[0];
        }

        this.letter = this.letter.toLocaleUpperCase();
      } else {
        this.letter = '?';
      }

      this._color = AppColors[idx % AppColors.length];
    } else {
      this.letter = '';
      this._color = 'var(--text-tertiary)';
    }
  }

  /**
   * Tries to get the application icon form the system.
   * Requires the app to be running in the electron wrapper.
   */
  private tryGetSystemIcon(p: IDandName) {
    if (!!window.app) {
      this.profileService.getAppProfile('local', p.ID)
        .pipe(
          switchMap(profile => window.app.getFileIcon(profile.LinkedPath))
        )
        .subscribe(
          icon => {
            if (iconsToIngore.some(i => i === icon)) {
              icon = "";
            }
            this.src = icon;
            this.changeDetectorRef.detectChanges();
          },
          console.error
        );
    }
  }
}

export const AppColors: string[] = [
  "rgba(244, 67, 54, .7)",
  "rgba(233, 30, 99, .7)",
  "rgba(156, 39, 176, .7)",
  "rgba(103, 58, 183, .7)",
  "rgba(63, 81, 181, .7)",
  "rgba(33, 150, 243, .7)",
  "rgba(3, 169, 244, .7)",
  "rgba(0, 188, 212, .7)",
  "rgba(0, 150, 136, .7)",
  "rgba(76, 175, 80, .7)",
  "rgba(139, 195, 74, .7)",
  "rgba(205, 220, 57, .7)",
  "rgba(255, 235, 59, .7)",
  "rgba(255, 193, 7, .7)",
  "rgba(255, 152, 0, .7)",
  "rgba(255, 87, 34, .7)",
  "rgba(121, 85, 72, .7)",
  "rgba(158, 158, 158, .7)",
  "rgba(96, 125, 139, .7)",
];
