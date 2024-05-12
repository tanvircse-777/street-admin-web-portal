import { Injectable } from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireList,
} from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private dbpath: string = '/feedback';
  public feedBackRef: AngularFireList<any>;
  constructor(private firebaseDb: AngularFireDatabase) {
    this.feedBackRef = firebaseDb.list(this.dbpath);
  }

  getAllFeedback() {
    return this.feedBackRef;
  }

  addFeedback(feedback: any) {
    return this.feedBackRef.push(feedback);
  }
}

export interface Feedback {
  name: string;
  email: string;
  feedback: string;
}
