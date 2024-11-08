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

@Component({
  selector: 'app-add-monthly-sell-cost',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NzDatePickerModule],
  templateUrl: './add-monthly-sell-cost.component.html',
  styleUrl: './add-monthly-sell-cost.component.scss',
})
export class AddMonthlySellCostComponent implements OnInit {
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
      this.getSellCostByDateRange(this.selectedStartDate, this.selectedEndDate);
    }
  }

  loadDaysData(days: number) {
    this.daysData.clear(); // Clear previous entries

    for (let day = 1; day <= days; day++) {
      const date = new Date(
        new Date().getFullYear(),
        this.months.findIndex((m) => m.name === this.selectedMonthName),
        day
      );
      const databaseDateFormat = this.formatDate(date);

      this.daysData.push(
        this._fb.group({
          date: { value: date.toDateString(), disabled: true }, // Display date in "Tue Jan 02 2024" format
          databaseDateFormat: [databaseDateFormat, Validators.required], // Hidden date in "YYYY-MM-DD" format for DB
          sell: [0],
          cost: [0],
          // sell: [null, Validators.required],
          // cost: [null, Validators.required]
        })
      );
    }
  }

  private subs: Subscription[] = [];
  public sellCostByDateRangeApiUrl: string = '';
  getSellCostByDateRange(startDate: string, endDate: string) {
    this.sellCostByDateRangeApiUrl = '';
    this.sellCostByDateRangeApiUrl =
      API_URL.SELL_COST_BY_DATE_RANGE + `/${startDate}/${endDate}`;
    this.subs.push(
      this._resourceService.get<any>(this.sellCostByDateRangeApiUrl).subscribe({
        next: (res: any) => {
          this._notificationService.success(
            'Sell and cost data fetched successfully!',
            ''
          );
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
          sell: apiEntry.sell ?? 0,
          cost: apiEntry.cost ?? 0,
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

  public createOrUpdateSellCost: string = API_URL.CREATE_OR_UPDATE_SELL;
  submit() {
    const result = this.form.getRawValue(); // Get all values including disabled date fields
    console.log('Form submitted:', result);
    let payload: any = {};
    payload.daysDate = result.daysData;
    this.subs.push(
      this._resourceService
        .post<any, any>(payload, this.createOrUpdateSellCost)
        .subscribe({
          next: (res: any) => {
            this._notificationService.success(
              'Data submitted successfully!',
              ''
            );

            this.getSellCostByDateRange(
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
}
