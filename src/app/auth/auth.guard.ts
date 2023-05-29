import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable, map, of, switchMap } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    router: RouterStateSnapshot
  ): boolean | UrlTree | Promise<boolean> | Observable<boolean | UrlTree> {
    return this.authService.authStateChanges$?.pipe(
      switchMap(user => {
        if (user) {
          return of(true);
        } else {
          return of(this.router.createUrlTree(['/auth']));
        }
      })
    ) ?? of(this.router.createUrlTree(['/auth']));;
  }
}