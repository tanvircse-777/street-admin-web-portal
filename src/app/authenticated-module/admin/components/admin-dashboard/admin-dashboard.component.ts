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
import { DateService } from '../../../../shared/services/date.service';

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
    this._date.getNextDateFromDate(new Date(), 30),
  ];
  public selectedStartDate: string = '';
  public selectedEndDate: string = '';
  public sellByDateRangeApiUrl: string = '';

  public selectedMonth: any;
  public sellByMonthApiUrl: string = '';

  public selectedYear: any;
  public sellByYearApiUrl: string = '';

  public tabs = [
    {
      name: 'Tab 1',
      disabled: false,
    },
    {
      name: 'Tab 2',
      disabled: false,
    },
    {
      name: 'Tab 3',
      disabled: false,
    },
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public _resourceService: ResourceService,
    private _date: DateService,
    private _formateDate: FormatDateService,
    private _notificationService: NzNotificationService
  ) {}

  private sellChart: Highcharts.Chart | null = null;
  public sellDataForChart: any[] = [];
  private createChartLine(): void {
    this.sellChart = Highcharts.chart('chart-line', {
      chart: {
        type: 'line',
      },
      title: {
        text: `Selling info`,
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

  onChangeTab(event: any) {
    console.log(event);
    if (event.index == 0) {
      this.selectedDateRange = [
        new Date(),
        this._date.getNextDateFromDate(new Date(), 30),
      ];
      this.selectedStartDate = this._formateDate.formatDateToYYYYMMDD(
        this.selectedDateRange[0]
      );
      this.selectedEndDate = this._formateDate.formatDateToYYYYMMDD(
        this.selectedDateRange[1]
      );
      this.getSellByDateRange(this.selectedStartDate, this.selectedEndDate);
    } else if (event.index == 1) {
      // this.sele;
    } else if (event.index == 2) {
    }
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

  onChangeMonth(result: Date): void {
    console.log('onChangeMonth: ', result);

    let { startDate, endDate }: any =
      this._date.getMonthStartAndEndDates(result);

    this.selectedStartDate = startDate;
    this.selectedEndDate = endDate;

    console.log(this.selectedStartDate);
    console.log(this.selectedEndDate);

    this.getSellByDateRange(this.selectedStartDate, this.selectedEndDate);
  }

  onChangeYear(result: Date): void {
    console.log('onChangeMonth: ', result);

    let year = result.getUTCFullYear();

    console.log(year.toString());

    this.getSellByYear(year.toString());
  }

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
          console.log('this.sellDataForChart', this.sellDataForChart);
          this.updateChartData();
        },
        error: (err) => {
          console.log('err', err);
        },
        complete: () => {},
      })
    );
  }

  getSellByYear(year: string) {
    this.sellByYearApiUrl = '';
    this.sellByYearApiUrl = API_URL.SELL_BY_YEAR + `/${year}`;
    this.subs.push(
      this._resourceService.get<any>(this.sellByYearApiUrl).subscribe({
        next: (res: any) => {
          console.log('sell data by date range');
          console.log(res);
          this._notificationService.success(
            'Sell data fetched successfully!',
            ''
          );
          this.sellDataForChart = this.convertDataForYearlyChart(res);
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

  convertDataForYearlyChart(apiData: any[]): any[] {
    return apiData.map((item) => {
      return [item.month, Number(item.amount)];
    });
  }

  updateChartData(): void {
    if (this.sellChart) {
      this.sellChart.series[0].setData(this.sellDataForChart, true); // Update chart data
    } else {
      this.createChartLine();
    }
  }

  public ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.createChartLine();
    }
  }
}
