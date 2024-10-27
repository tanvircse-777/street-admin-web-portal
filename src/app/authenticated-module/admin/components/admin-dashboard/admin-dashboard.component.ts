import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsSolidGauge from 'highcharts/modules/solid-gauge';
import HighchartsSunburst from 'highcharts/modules/sunburst';
import { FormatDateService } from '../../../../shared/services/format-date.service';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { API_URL } from '../../../../shared/api-urls/api-urls.api';
import { ResourceService } from '../../../../shared/services/resource.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

HighchartsMore(Highcharts);
HighchartsSolidGauge(Highcharts);
HighchartsSunburst(Highcharts);

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements AfterViewInit {
  private subs: Subscription[] = [];
  public selectedDateRange: Date[] = [
    new Date(),
    this.getNextDateFromDate(new Date(), 30),
  ];
  public selectedStartDate: string = '';
  public selectedEndDate: string = '';
  public sellByDateRangeApiUrl: string = '';

  private sellData: any = [
    ['1/10/2024', this.getRandomNumber(8000, 13000)],
    ['2/10/2024', this.getRandomNumber(8000, 13000)],
    ['3/10/2024', this.getRandomNumber(8000, 13000)],
    ['4/10/2024', this.getRandomNumber(8000, 13000)],
    ['5/10/2024', this.getRandomNumber(8000, 13000)],
    ['6/10/2024', this.getRandomNumber(8000, 13000)],
    ['7/10/2024', this.getRandomNumber(8000, 13000)],
    ['8/10/2024', this.getRandomNumber(8000, 13000)],
    ['9/10/2024', this.getRandomNumber(8000, 13000)],
    ['10/10/2024', this.getRandomNumber(8000, 13000)],
    ['11/10/2024', this.getRandomNumber(8000, 13000)],
    ['12/10/2024', this.getRandomNumber(8000, 13000)],
    ['13/10/2024', this.getRandomNumber(8000, 13000)],
    ['14/10/2024', this.getRandomNumber(8000, 13000)],
    ['15/10/2024', this.getRandomNumber(8000, 13000)],
    ['16/10/2024', this.getRandomNumber(8000, 13000)],
    ['17/10/2024', this.getRandomNumber(8000, 13000)],
    ['18/10/2024', this.getRandomNumber(8000, 13000)],
    ['19/10/2024', this.getRandomNumber(8000, 13000)],
    ['20/10/2024', this.getRandomNumber(8000, 13000)],
    ['21/10/2024', this.getRandomNumber(8000, 13000)],
    ['22/10/2024', this.getRandomNumber(8000, 13000)],
    ['23/10/2024', this.getRandomNumber(8000, 13000)],
    ['24/10/2024', this.getRandomNumber(8000, 13000)],
    ['25/10/2024', this.getRandomNumber(8000, 13000)],
    ['26/10/2024', this.getRandomNumber(8000, 13000)],
    ['27/10/2024', this.getRandomNumber(8000, 13000)],
    ['28/10/2024', this.getRandomNumber(8000, 13000)],
    ['29/10/2024', this.getRandomNumber(8000, 13000)],
    ['30/10/2024', this.getRandomNumber(8000, 13000)],
    ['31/10/2024', this.getRandomNumber(8000, 13000)],
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public _resourceService: ResourceService,
    private _formateDate: FormatDateService,
    private _notificationService: NzNotificationService
  ) {}

  private sellChart: Highcharts.Chart | null = null;
  private createChartLine(): void {
    const data: any[] = this.sellDataForChart;

    console.log(data);

    this.sellChart = Highcharts.chart('chart-line', {
      chart: {
        type: 'line',
      },
      title: {
        text: 'Selling info(October 2024)',
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      yAxis: {
        title: {
          text: null,
        },
      },
      xAxis: {
        type: 'category',
      },
      tooltip: {
        headerFormat: `<div>Date: {point.key}</div>`,
        pointFormat: `<div>{series.name}: {point.y}</div>`,
        shared: true,
        useHTML: true,
      },
      series: [
        {
          name: 'Amount',
          data: this.sellDataForChart,
        },
      ],
    } as any);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.selectedStartDate = this._formateDate.formatDateToYYYYMMDD(
        this.selectedDateRange[0]
      );
      this.selectedEndDate = this._formateDate.formatDateToYYYYMMDD(
        this.selectedDateRange[1]
      );
      this.getSellByDateRange(this.selectedStartDate, this.selectedEndDate);
    }
  }

  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  onChangeDateRange(result: Date[]): void {
    console.log('onChange: ', result);
    this.selectedStartDate = this._formateDate.formatDateToYYYYMMDD(
      this.selectedDateRange[0]
    );
    this.selectedEndDate = this._formateDate.formatDateToYYYYMMDD(
      this.selectedDateRange[1]
    );
    console.log('selectedStartDate: ', this.selectedStartDate);
    console.log('selectedEndDate: ', this.selectedEndDate);

    this.getSellByDateRange(this.selectedStartDate, this.selectedEndDate);
  }

  public sellDataForChart: any[] = [];
  getSellByDateRange(startDate: string, endDate: string) {
    this.sellByDateRangeApiUrl = '';
    this.sellByDateRangeApiUrl =
      API_URL.SELL_BY_DATE_RANGE + `/${startDate}/${endDate}`;
    this.subs.push(
      this._resourceService.get<any>(this.sellByDateRangeApiUrl).subscribe({
        next: (res: any) => {
          console.log('sell data by date range');
          console.log(res);
          this._notificationService.success(
            'Sell data fetched successfully!',
            ''
          );
          this.sellDataForChart = this.convertDataForChart(res);
          this.updateChartData();
        },
        error: (err) => {
          console.log('err', err);
        },
        complete: () => {},
      })
    );
  }

  convertDataForChart(apiData: any[]): any[] {
    return apiData.map((item) => {
      item.date = this._formateDate.convertYYYYMMDDStringToDDMMYYYYString(
        item.date
      );
      return [item.date, item.amount];
    });
  }

  updateChartData(): void {
    if (this.sellChart) {
      this.sellChart.series[0].setData(this.sellDataForChart, true); // Update chart data
    }
  }

  getNextDateFromDate(date: Date, daysToAdd: number): Date {
    const newDate = new Date(date); // Create a copy of the original date
    newDate.setDate(newDate.getDate() + daysToAdd); // Add the specified number of days
    return newDate;
  }

  public ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.createChartLine();
    }
  }
}
