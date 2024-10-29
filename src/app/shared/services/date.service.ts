import { Injectable } from '@angular/core';
// @ts-ignore

@Injectable({
  providedIn: 'root',
})
export class DateService {
  
  getNextDateFromDate(date: Date, daysToAdd: number): Date {
    const newDate = new Date(date); // Create a copy of the original date
    newDate.setDate(newDate.getDate() + daysToAdd); // Add the specified number of days
    return newDate;
  }

  getMonthStartAndEndDates(date: Date): { startDate: string; endDate: string } {
    // Set startDate to the first day of the month
    const startDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), 1)
    );

    // Set endDate to the last day of the month by setting to the 0th day of the next month
    const endDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth() + 1, 0)
    );

    // Format dates as 'YYYY-MM-DD'
    const format = (d: Date) => d.toISOString().split('T')[0];

    return {
      startDate: format(startDate),
      endDate: format(endDate),
    };
  }

  getYearStartAndEndDates(date: Date): { startDate: string; endDate: string } {
    // Set startDate to the first day of the year
    const startDate = new Date(Date.UTC(date.getFullYear(), 0, 1));

    // Set endDate to the last day of the year
    const endDate = new Date(Date.UTC(date.getFullYear(), 11, 31));

    // Format dates as 'YYYY-MM-DD'
    const format = (d: Date) => d.toISOString().split('T')[0];

    return {
      startDate: format(startDate),
      endDate: format(endDate),
    };
  }
}
