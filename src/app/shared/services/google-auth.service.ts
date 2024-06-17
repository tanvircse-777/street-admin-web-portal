// // src/app/auth.service.ts
// import {
//   GoogleLoginProvider,
//   SocialAuthService,
//   SocialUser,
// } from '@abacritt/angularx-social-login';
// import { Injectable, NgZone } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class GoogleAuthService {
//   private userSubject: BehaviorSubject<SocialUser | null> =
//     new BehaviorSubject<SocialUser | null>(null);
//   user$ = this.userSubject.asObservable();

//   constructor(private authService: SocialAuthService, private ngZone: NgZone) {
//     if (this.isBrowser()) {
//       this.loadUserFromLocalStorage();
//     }
//     this.authService.authState.subscribe((user) => {
//       this.ngZone.run(() => {
//         if (user) {
//           this.setUser(user, false); // Do not update localStorage here
//         } else {
//           this.clearUser();
//         }
//       });
//     });
//   }

//   private isBrowser(): boolean {
//     return (
//       typeof window !== 'undefined' &&
//       typeof window.localStorage !== 'undefined'
//     );
//   }

//   private loadUserFromLocalStorage() {
//     const storedUser = localStorage.getItem('google_auth');
//     if (storedUser) {
//       const user = JSON.parse(storedUser) as SocialUser;
//       this.userSubject.next(user);
//       // Optionally: Refresh the session with Google if possible
//     }
//   }

//   private setUser(user: SocialUser, updateLocalStorage: boolean = true) {
//     this.userSubject.next(user);
//     if (updateLocalStorage && this.isBrowser()) {
//       localStorage.setItem('google_auth', JSON.stringify(user));
//     }
//   }

//   private clearUser() {
//     this.userSubject.next(null);
//     if (this.isBrowser()) {
//       localStorage.removeItem('google_auth');
//     }
//   }

//   signInWithGoogle(): void {
//     this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then((user) => {
//       this.setUser(user);
//     });
//   }

//   signOut(): void {
//     if (this.getUser()) {
//       this.authService
//         .signOut()
//         .then(() => {
//           this.clearUser();
//         })
//         .catch((err) => {
//           console.error('Sign out error:', err);
//         });
//     } else {
//       console.error('Not logged in');
//     }
//   }

//   getUser(): SocialUser | null {
//     return this.userSubject.value;
//   }

//   isLoggedIn(): boolean {
//     return this.getUser() !== null;
//   }
// }
