import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Subscription, interval } from 'rxjs';
import {
  Feedback,
  FeedbackService,
} from '../../shared/services/feedback.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements OnInit, OnDestroy {
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
  public feedbackList: Feedback[] = [];

  public feedbackForm: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    email: new FormControl(null, [Validators.required]),
    feedback: new FormControl(null, [Validators.required]),
  });
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _feedbackService: FeedbackService,
    private _fb: FormBuilder,
    private _notificationService: NzNotificationService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Execute this code only in the browser environment
      this.updateBackgroundImage();
      // this.intervalSubscription = interval(5000).subscribe(() => {
      //   this.updateBackgroundImage();
      // });
      this.getAllFeedback();
    }
  }

  updateBackgroundImage() {
    this.backgroundImageUrl = this.backgroundImageUrls[this.currentIndex];
    this.currentIndex++;
    if (this.currentIndex == this.backgroundImageUrls.length)
      this.currentIndex = 0;
  }

  getAllFeedback() {
    this._feedbackService
      .getAllFeedback()
      .snapshotChanges()
      .subscribe({
        next: (data: any) => {
          this.feedbackList = [];
          data.map((action: any) => {
            const data = action.payload.val();

            this.feedbackList.push(data);
          });
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }

  addFeedback() {
    this._feedbackService.addFeedback(this.feedbackForm.value as Feedback);
    this.feedbackForm.reset();
    this._notificationService.create(
      'success',
      'Feedback Added!',
      'Thank you for your valuable feedback. It means a lot to us. Give feedback as much as possible so that we can improve our services fast!'
    );
  }
  ngOnDestroy() {
    // Unsubscribe from the interval when the component is destroyed
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }
}
