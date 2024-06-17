import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { FeedbackService } from '../../shared/services/feedback.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Feedback } from '../../shared/models/feedback.model';
import { ResourceService } from '../../shared/services/resource.service';
import { API_URL } from '../../shared/api-urls/api-urls.api';
import {
  GoogleLoginProvider,
  SocialAuthService,
  SocialUser,
} from '@abacritt/angularx-social-login';
import { Router } from '@angular/router';
// import { GoogleAuthService } from '../../shared/services/google-auth.service';

declare var google: any;
@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private subs: Subscription[] = [];
  public backgroundImageUrl: string = '';
  public currentIndex: number = 0;
  private intervalSubscription: Subscription = new Subscription();
  public backgroundImageUrls: string[] = [
    // 'https://img.freepik.com/free-photo/top-view-fast-food-concept-with-copyspace_23-2147819594.jpg?t=st=1711049248~exp=1711052848~hmac=6f5d087cc95754ab51c494bdef970b8a9c2c1ee8a202057531bf9b1628730c1d&w=1380',
    'assets/images/homepage/backup/top-view-fried-egg-with-asparagus.jpg',
    'assets/images/homepage/background_1.jpg',
    'assets/images/homepage/background_2.jpg',
    'assets/images/homepage/background_3.jpg',
  ];
  public topItems: any[] = [
    {
      name: 'Special Burger',
      price: 50,
      details: 'Great combination of sauce and meyonese',
    },
    {
      name: 'Pasta',
      price: 50,
      details: 'Great combination of sauce and meyonese',
    },
    {
      name: 'Nachos',
      price: 70,
      details: 'Great combination of sauce and meyonese',
    },
    {
      name: 'Chickent Munchurian',
      price: 100,
      details: 'Great combination of sauce and meyonese',
    },
  ];
  public allFeedbackApiUrl: string = API_URL.ALL_FEEDBACK;
  public createFeedbackApiUrl: string = API_URL.CREATE_FEEDBACK;
  public feedbackList: Feedback[] = [];

  public feedbackForm: FormGroup = new FormGroup({
    givenBy: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required]),
    feedback: new FormControl(null, [Validators.required]),
  });

  public isLoginModalVisible: boolean = false;
  public isLoginLoading: boolean = false;
  public user: SocialUser = new SocialUser();
  public isLoggedIn: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public _resourceService: ResourceService,
    private _feedbackService: FeedbackService,
    // private _googleAuthService: GoogleAuthService,
    private _fb: FormBuilder,
    private _notificationService: NzNotificationService,
    private _router: Router // private _socialAuthService: SocialAuthService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Execute this code only in the browser environment
      this.updateBackgroundImage();
      // this.loginWithGoogle();
      this.getAllFeedback();
      google.accounts.id.initialize({
        client_id:
          '636524100093-lud4g3kbsfpbpn1590nuhrte7jjran5u.apps.googleusercontent.com',
        callback: (res: any) => {
          console.log('res from new method');
          console.log(res);
          this.handleLogin(res);
        },
      });
      google.accounts.id.renderButton(document.getElementById('google-btn'), {
        theme: 'filled_blue',
        size: 'large',
        width: 350,
      });

      if (sessionStorage.getItem('google_auth')) {
        this.isLoggedIn = true;
      }
      // google.accounts.id.initialize({
      //   client_id:
      //     '636524100093-lud4g3kbsfpbpn1590nuhrte7jjran5u.apps.googleusercontent.com',
      //   callback: (res: any) => {},
      // });
      // google.accounts.id.renderButton(document.getElementById('google-btn'), {
      //   theme: 'filled_blue',
      //   size: 'large',
      //   width: 350,
      // });
      // this.userSubscription();
    }
  }
  updateBackgroundImage() {
    this.backgroundImageUrl = this.backgroundImageUrls[this.currentIndex];
    this.currentIndex++;
    if (this.currentIndex == this.backgroundImageUrls.length)
      this.currentIndex = 0;
  }

  handleLogin(res: any) {
    if (res) {
      debugger;
      const payload = this.decodeToken(res.credential);
      sessionStorage.setItem('google_auth', JSON.stringify(payload));
      this.isLoggedIn = true;
      window.location.reload();
    }
  }

  signOut() {
    debugger;
    google.accounts.id.disableAutoSelect();
    google.accounts.id.renderButton(document.getElementById('google-btn'), {
      theme: 'filled_blue',
      size: 'large',
      width: 350,
    });
    sessionStorage.removeItem('google_auth');
    this.isLoggedIn = false;
    window.location.reload();
    // google.accounts.id.renderButton(document.getElementById('google-btn'), {
    //   theme: 'filled_blue',
    //   size: 'large',
    //   width: 350,
    // });
  }

  private decodeToken(token: string) {
    return JSON.parse(atob(token.split('.')[0]));
  }
  // userSubscription() {
  //   this._googleAuthService.user$.subscribe((user) => {
  //     user ? (this.user = user) : (this.user = new SocialUser());
  //     this.isLoggedIn = user !== null;
  //   });
  // }

  // loginWithGoogle(): void {
  //   this._googleAuthService.signInWithGoogle();
  // }

  // logout(): void {
  //   this._googleAuthService.signOut();
  // }
  // getAuthDataFromLocalStorage() {
  //   let googleAuthData: any = localStorage.getItem('google_auth');
  //   let parsedGoogleAuthData: any = JSON.parse(googleAuthData);
  //   if (parsedGoogleAuthData) {
  //     debugger;
  //     this.user = parsedGoogleAuthData;
  //     this.isLoggedIn = true;
  //     this.isLoginModalVisible = false;
  //     this.isLoginLoading = false;
  //     this.feedbackForm.patchValue({
  //       givenBy: this.user.name,
  //       email: this.user.email,
  //     });

  //     this.signInWithGoogle();
  //   }
  // }

  // showLoginModal(): void {
  //   this.isLoginModalVisible = true;
  // }

  // handleLoginModalOk(): void {
  //   console.log('Button ok clicked!');
  //   // this.isLoginModalVisible = false;
  // }

  // handleLoginModalCancel(): void {
  //   console.log('Button cancel clicked!');
  //   this.isLoginModalVisible = false;
  // }

  // getGoogleSignInStatus() {
  //   this._socialAuthService.authState.subscribe((user) => {
  //     debugger;
  //     this.user = user;
  //     this.isLoggedIn = user != null;
  //     // console.log('isLoggedIn');
  //     // console.log(this.isLoggedIn);
  //     // console.log('user info');
  //     // console.log(this.user.name);
  //     if (this.isLoggedIn) {
  //       this.isLoginModalVisible = false;
  //       this.isLoginLoading = false;
  //       this._notificationService.success('Signed in succesfully!', '');
  //       localStorage.setItem('google_auth', JSON.stringify(this.user));
  //       // this._router.navigateByUrl('/dashboard').then();
  //     } else {
  //       localStorage.removeItem('google_auth');
  //       this._notificationService.success('Signed out succesfully!', '');
  //     }
  //   });
  // }

  // signInWithGoogle(): void {
  //   this._socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
  // }

  // signOut(): void {
  //   // localStorage.removeItem('google_auth');
  //   // this.user = new SocialUser();
  //   // this.isLoggedIn = false;
  //   this._socialAuthService.signOut();
  // }

  getAllFeedback() {
    this.subs.push(
      this._resourceService.get<any>(this.allFeedbackApiUrl).subscribe({
        next: (res: any) => {
          console.log('all feedback');
          console.log(res);
          this.feedbackList = res;
        },
        error: (err) => {
          console.log('err', err);
        },
        complete: () => {},
      })
    );
  }

  addFeedback() {
    this.subs.push(
      this._resourceService
        .post<any, any>(this.feedbackForm.value, this.createFeedbackApiUrl)
        .subscribe({
          next: (res: any) => {
            console.log('create feedback response');
            console.log(res);
            this._notificationService.success(
              'Thank you for your valuable Feedback!',
              ''
            );
            if (this.isLoggedIn) {
              this.feedbackForm.controls['feedback'].setValue(null);
            } else {
              this.feedbackForm.reset();
            }
            this.getAllFeedback();
          },
          error: (err) => {
            console.log('err', err);
          },
          complete: () => {},
        })
    );
  }

  ngAfterViewInit() {}
  ngOnDestroy() {
    // Unsubscribe from the interval when the component is destroyed
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }
}
