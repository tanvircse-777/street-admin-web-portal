import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Feedback } from '../../shared/models/feedback.model';
import { ResourceService } from '../../shared/services/resource.service';
import { API_URL } from '../../shared/api-urls/api-urls.api';
import { Router } from '@angular/router';
import { FIRST_TIME_LOGIN_OFFER_TEMPLATE } from '../../shared/constants/first-login-offer';

declare let google: any;
@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements OnInit, OnDestroy {
  public backgroundImageUrl: string = '';
  public currentIndex: number = 0;
  public backgroundImageUrls: string[] = [
    'assets/images/homepage/backup/hero-cover-2.jpg',
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
  public feedbackForm: FormGroup = new FormGroup({
    givenBy: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required]),
    feedback: new FormControl(null, [Validators.required]),
  });

  private subs: Subscription[] = [];
  private intervalSubscription: Subscription = new Subscription();
  public allFeedbackApiUrl: string = API_URL.ALL_FEEDBACK;
  public createFeedbackApiUrl: string = API_URL.CREATE_FEEDBACK;
  public createCustomerApiUrl: string = API_URL.CREATE_CUSTOMER;
  public customerInfoByEmailApiUrl: string = API_URL.CUSTOMER_INFO_BY_EMAIL;
  public isCustomerExistApiUrl: string = API_URL.IS_CUSTOMER_EXIST;
  public feedbackList: Feedback[] = [];
  public isLoginModalVisible: boolean = false;
  public isLoginLoading: boolean = false;
  public user: any;
  public isLoggedIn: boolean = false;
  public isOfferModalVisible: boolean = false;
  public isCustomerExist: boolean = false;
  public createCustomerLoading: boolean = false;
  public customerInfo: any = {};
  public addFeedbackLoading: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public _resourceService: ResourceService,
    private _notificationService: NzNotificationService,
    private _router: Router
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Execute this code only in the browser environment
      this.updateBackgroundImage();
      this.getAllFeedback();
      this.setGoogleAuthentication();
      this.renderGoogleLoginButton();
      this.loadAuthDataFromLocalStorageIfExist();
    }
  }

  updateBackgroundImage() {
    this.backgroundImageUrl = this.backgroundImageUrls[this.currentIndex];
    this.currentIndex++;
    if (this.currentIndex == this.backgroundImageUrls.length)
      this.currentIndex = 0;
  }

  setGoogleAuthentication() {
    google.accounts.id.initialize({
      client_id:
        '636524100093-lud4g3kbsfpbpn1590nuhrte7jjran5u.apps.googleusercontent.com',
      callback: (res: any) => {
        console.log('res from new method');
        console.log(res);
        this.handleSignin(res);
      },
    });
  }

  renderGoogleLoginButton() {
    google.accounts.id.renderButton(document.getElementById('google-btn'), {
      theme: 'filled_blue',
      size: 'large',
      width: 280,
    });
  }

  handleSignin(res: any) {
    if (res) {
      this.user = this.decodeToken(res.credential);
      console.log('payload');
      console.log(this.user.name);

      localStorage?.setItem('google_auth', JSON.stringify(this.user));
      this.isLoggedIn = true;
      this._notificationService.success('You are signed in!', '');
      this.checkIsCustomerExist();
    }
  }

  loadAuthDataFromLocalStorageIfExist() {
    if (localStorage?.getItem('google_auth')) {
      let authData: any = localStorage?.getItem('google_auth');
      this.user = JSON.parse(authData);
      this.isLoggedIn = true;
      this.feedbackForm.patchValue({
        givenBy: this.user.name,
        email: this.user.email,
      });
      this.getCustomerInfoByEmail(false);
      this._notificationService.success('You are signed in!', '');
      console.log(localStorage?.getItem('google_auth'));
    } else {
      this._notificationService.warning(
        'Please sign in for exciting offers!',
        '',
        { nzDuration: 5000 }
      );
    }
  }

  signOut() {
    google.accounts.id.disableAutoSelect();
    localStorage?.removeItem('google_auth');
    this.isLoggedIn = false;
    window.location.reload();
  }

  private decodeToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
  }

  checkIsCustomerExist() {
    this.subs.push(
      this._resourceService
        .getWithUrlParam<{ isCustomerExist: boolean }>(
          this.isCustomerExistApiUrl,
          this.user.email
        )
        .subscribe({
          next: (res: { isCustomerExist: boolean }) => {
            console.log('checkIsCustomerExist');
            console.log(res);
            this.isCustomerExist = res.isCustomerExist;
            if (this.isCustomerExist) {
              this.getCustomerInfoByEmail(false);
            } else {
              //create customer api call
              this.createCustomer();
            }
          },
          error: (err) => {
            console.log('err', err);
          },
          complete: () => {},
        })
    );
  }

  createCustomer() {
    this.createCustomerLoading = true;
    let customerData: any = {
      name: this.user.name,
      email: this.user.email,
      mobile_no: this.user?.mobile_no,
      currentOffer: FIRST_TIME_LOGIN_OFFER_TEMPLATE,
    };
    this.subs.push(
      this._resourceService
        .post<any, any>(customerData, this.createCustomerApiUrl)
        .subscribe({
          next: (res: any) => {
            this.createCustomerLoading = false;
            console.log('create customer response');
            console.log(res);
            this.getCustomerInfoByEmail(true);
          },
          error: (err) => {
            this.createCustomerLoading = false;
            console.log('err', err);
          },
          complete: () => {
            this.createCustomerLoading = false;
          },
        })
    );
  }

  getCustomerInfoByEmail(forNewlyCreatedCustomer: boolean) {
    this.subs.push(
      this._resourceService
        .getWithUrlParam<any>(this.customerInfoByEmailApiUrl, this.user.email)
        .subscribe({
          next: (res: any) => {
            console.log('user info by email');
            console.log(res);
            this.customerInfo = res;
            if (forNewlyCreatedCustomer) {
              this.showOfferModal();
            }
          },
          error: (err) => {
            console.log('err', err);
          },
          complete: () => {},
        })
    );
  }

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
    this.addFeedbackLoading = true;
    this.subs.push(
      this._resourceService
        .post<any, any>(this.feedbackForm.value, this.createFeedbackApiUrl)
        .subscribe({
          next: (res: any) => {
            this.addFeedbackLoading = false;
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
            this.addFeedbackLoading = false;
            console.log('err', err);
          },
          complete: () => {
            this.addFeedbackLoading = false;
          },
        })
    );
  }

  showOfferModal(): void {
    this.isOfferModalVisible = true;
  }

  handleOfferModalOk(): void {
    this.isOfferModalVisible = false;
  }

  handleOfferModalCancel(): void {
    this.isOfferModalVisible = false;
  }

  goToCustomerOfferList() {
    this._router.navigate(['authenticated/customer/offer-list']);
  }

  ngOnDestroy() {
    // Unsubscribe from the interval when the component is destroyed
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
    this.subs.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
