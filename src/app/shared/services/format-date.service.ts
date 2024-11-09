import { Injectable } from '@angular/core';
// @ts-ignore

@Injectable({
  providedIn: 'root',
})
export class FormatDateService {
  formatDateToYYYYMMDD(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  convertYYYYMMDDStringToDDMMYYYYString(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  }

  convertYYYYMMDDStringToYYYYMMString(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${year}-${month}`;
  }
}
