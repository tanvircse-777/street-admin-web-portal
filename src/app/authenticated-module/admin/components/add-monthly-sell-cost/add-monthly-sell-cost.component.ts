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

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      selectedMonth: [null, Validators.required],
      daysData: this.fb.array([]),
    });
  }

  ngOnInit() {
    // Initialize with the default or selected month if needed
  }

  get daysData(): FormArray {
    return this.form.get('daysData') as FormArray;
  }

  public selectedMonthName: string = '';
  onMonthChange() {
    debugger;
    const selectedMonth = this.form.get('selectedMonth')?.value;
    if (selectedMonth) {
      this.selectedMonthName = selectedMonth.toLocaleString('default', {
        month: 'long',
      });
      const daysInMonth =
        this.months.find((month) => month.name === this.selectedMonthName)
          ?.days || 0;
      this.loadDaysData(daysInMonth);
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
        this.fb.group({
          date: { value: date.toDateString(), disabled: true }, // Display date in "Tue Jan 02 2024" format
          databaseDateFormat: [databaseDateFormat, Validators.required], // Hidden date in "YYYY-MM-DD" format for DB
          sell: [null],
          cost: [null],
          // sell: [null, Validators.required],
          // cost: [null, Validators.required]
        })
      );
    }
  }

  // Helper function to format date as YYYY-MM-DD
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  submit() {
    const result = this.form.getRawValue(); // Get all values including disabled date fields
    console.log('Form submitted:', result);
  }
}
