import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { API_URL } from '../../../../shared/api-urls/api-urls.api';
import { Subscription } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DateService } from '../../../../shared/services/date.service';
import { FormatDateService } from '../../../../shared/services/format-date.service';
import { ResourceService } from '../../../../shared/services/resource.service';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';

@Component({
  selector: 'app-add-monthly-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzDatePickerModule,
    NzTimePickerModule,
  ],
  templateUrl: './add-monthly-attendance.component.html',
  styleUrl: './add-monthly-attendance.component.scss',
})
export class AddMonthlyAttendanceComponent implements OnInit {
  form: FormGroup;
  months = [
    { name: 'January', days: 31 },
    { name: 'February', days: 28 }, // Handle leap years separately if needed
    { name: 'March', days: 31 },
    { name: 'April', days: 30 },
    { name: 'May', days: 31 },
    { name: 'June', days: 30 },
    { name: 'July', days: 31 },
    { name: 'August', days: 31 },
    { name: 'September', days: 30 },
    { name: 'October', days: 31 },
    { name: 'November', days: 30 },
    { name: 'December', days: 31 },
  ];

  constructor(
    private _fb: FormBuilder,

    public _resourceService: ResourceService,
    private _date: DateService,
    private _formateDate: FormatDateService,
    private _notificationService: NzNotificationService
  ) {
    this.form = this._fb.group({
      selectedMonth: [null, Validators.required],
      daysData: this._fb.array([]),
    });
  }

  ngOnInit() {
    // Initialize with the default or selected month if needed
  }

  get daysData(): FormArray {
    return this.form.get('daysData') as FormArray;
  }

  public selectedMonthName: string = '';
  public selectedStartDate: string = '';
  public selectedEndDate: string = '';
  onMonthChange(event: any) {
    const selectedMonth = this.form.get('selectedMonth')?.value;
    if (selectedMonth) {
      this.selectedMonthName = selectedMonth.toLocaleString('default', {
        month: 'long',
      });
      const daysInMonth =
        this.months.find((month) => month.name === this.selectedMonthName)
          ?.days || 0;
      this.loadDaysData(daysInMonth);

      let { startDate, endDate }: any =
        this._date.getMonthStartAndEndDates(event);

      this.selectedStartDate = startDate;
      this.selectedEndDate = endDate;
      this.getAttendacneByDateRange(
        this.selectedStartDate,
        this.selectedEndDate
      );
    }
  }
  public laodForm: boolean = false;
  loadDaysData(days: number) {
    this.daysData.clear(); // Clear previous entries

    for (let day = 1; day <= days; day++) {
      const date = new Date(
        new Date().getFullYear(),
        this.months.findIndex((m) => m.name === this.selectedMonthName),
        day
      );
      const databaseDateFormat = this.formatDate(date);
      console.log('databaseDateFormat');
      console.log(databaseDateFormat);

      this.daysData.push(
        this._fb.group({
          date: { value: date.toDateString(), disabled: true }, // Display date in "Tue Jan 02 2024" format
          databaseDateFormat: [databaseDateFormat, Validators.required], // Hidden date in "YYYY-MM-DD" format for DB
          tanvirInTime: [this.convertTimeStringToDate('18:00')],
          tanvirOutTime: [this.convertTimeStringToDate('18:00')],
          shakilInTime: [this.convertTimeStringToDate('18:00')],
          shakilOutTime: [this.convertTimeStringToDate('18:00')],
          tarikInTime: [this.convertTimeStringToDate('18:00')],
          tarikOutTime: [this.convertTimeStringToDate('18:00')],
        })
      );
    }

    this.laodForm = true;
  }

  private subs: Subscription[] = [];
  public attendacneByDateRangeApiUrl: string = '';
  getAttendacneByDateRange(startDate: string, endDate: string) {
    this.attendacneByDateRangeApiUrl = '';
    this.attendacneByDateRangeApiUrl =
      API_URL.ATTENDANCE_BY_DATE_RANGE + `/${startDate}/${endDate}`;
    this.subs.push(
      this._resourceService
        .get<any>(this.attendacneByDateRangeApiUrl)
        .subscribe({
          next: (res: any) => {
            this._notificationService.success(
              'attendance data fetched successfully!',
              ''
            );
            console.log('attendance data');

            console.log(res);

            this.patchDaysData(res);
          },
          error: (err) => {
            console.log('err', err);
          },
          complete: () => {},
        })
    );
  }

  patchDaysData(apiData: any[]) {
    apiData.forEach((apiEntry) => {
      const matchingControl = this.daysData.controls.find(
        (control) => control.get('databaseDateFormat')?.value === apiEntry.date
      );
      if (matchingControl) {
        matchingControl.patchValue({
          tanvirInTime: apiEntry.tanvirInTime
            ? this.convertTimeStringToDate(apiEntry.tanvirInTime)
            : null,
          tanvirOutTime: apiEntry.tanvirOutTime
            ? this.convertTimeStringToDate(apiEntry.tanvirOutTime)
            : null,
          shakilInTime: apiEntry.shakilInTime
            ? this.convertTimeStringToDate(apiEntry.shakilInTime)
            : null,
          shakilOutTime: apiEntry.shakilOutTime
            ? this.convertTimeStringToDate(apiEntry.shakilOutTime)
            : null,
          tarikInTime: apiEntry.tarikInTime
            ? this.convertTimeStringToDate(apiEntry.tarikInTime)
            : null,
          tarikOutTime: apiEntry.tarikOutTime
            ? this.convertTimeStringToDate(apiEntry.tarikOutTime)
            : null,
        });
      }
    });
  }

  // Helper function to format date as YYYY-MM-DD
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  convertTimeStringToDate(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  public createOrUpdateAttendacne: string = API_URL.CREATE_OR_UPDATE_ATTENDANCE;
  submit() {
    const result = this.form.getRawValue(); // Get all values including disabled date fields
    let payload: any = {};
    payload.daysData = result.daysData;

    payload.daysData?.forEach((data: any) => {
      if (data.tanvirInTime)
        data.tanvirInTime = this.formatToTime(data.tanvirInTime);
      if (data.tanvirOutTime)
        data.tanvirOutTime = this.formatToTime(data.tanvirOutTime);

      if (data.shakilInTime)
        data.shakilInTime = this.formatToTime(data.shakilInTime);
      if (data.shakilOutTime)
        data.shakilOutTime = this.formatToTime(data.shakilOutTime);

      if (data.tarikInTime)
        data.tarikInTime = this.formatToTime(data.tarikInTime);
      if (data.tarikOutTime)
        data.tarikOutTime = this.formatToTime(data.tarikOutTime);
    });

    console.log('payload.daysData');
    console.log(payload.daysData);

    this.subs.push(
      this._resourceService
        .post<any, any>(payload, this.createOrUpdateAttendacne)
        .subscribe({
          next: (res: any) => {
            this._notificationService.success(
              'Data submitted successfully!',
              ''
            );

            this.getAttendacneByDateRange(
              this.selectedStartDate,
              this.selectedEndDate
            );
          },
          error: (err) => {
            console.log('err', err);
          },
          complete: () => {},
        })
    );
  }

  formatToTime(dateString: any) {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
