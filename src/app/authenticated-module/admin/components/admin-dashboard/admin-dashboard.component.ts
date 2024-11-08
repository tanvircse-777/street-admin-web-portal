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

  private sellChart: Highcharts.Chart | null = null;
  public sellDataForChart: any[] = [];
  public selectedDateRange: Date[] = [
    new Date(),
    this._date.getNextDateFromDate(new Date(), 30),
  ];
  public selectedStartDate: string = '';
  public selectedEndDate: string = '';
  public sellByDateRangeApiUrl: string = '';

  private monthlySellChart: Highcharts.Chart | null = null;
  public monthlySellDataForChart: any[] = [];
  public selectedMonth: Date = new Date();
  public selectedMonthsStartDate: string = '';
  public selectedMonthsEndDate: string = '';
  public sellByMonthApiUrl: string = '';

  private yearlySellChart: Highcharts.Chart | null = null;
  public yearlySellDataForChart: any[] = [];
  public selectedYear: Date = new Date();
  public selectedYearsStartDate: string = '';
  public selectedYearsEndDate: string = '';
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

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.getInitialDateRangeSellData();
      this.getInitialMonthlySellData();
      this.getInitialYearlySellData();
    }
  }

  getInitialDateRangeSellData() {
    this.selectedStartDate = this._formateDate.formatDateToYYYYMMDD(
      this.selectedDateRange[0]
    );
    this.selectedEndDate = this._formateDate.formatDateToYYYYMMDD(
      this.selectedDateRange[1]
    );
    this.getSellByDateRange(this.selectedStartDate, this.selectedEndDate);
  }

  getInitialMonthlySellData() {
    let { startDate, endDate }: any = this._date.getMonthStartAndEndDates(
      new Date()
    );

    this.selectedMonthsStartDate = startDate;
    this.selectedMonthsEndDate = endDate;

    this.getSellByMonth(
      this.selectedMonthsStartDate,
      this.selectedMonthsEndDate
    );
  }

  getInitialYearlySellData() {
    let date = new Date();
    let year = date.getUTCFullYear();
    this.getSellByYear(year.toString());
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

  createChartLine(): void {
    this.sellChart = Highcharts.chart('chart-line', {
      chart: {
        type: 'line',
      },
      title: {
        text: `Custom Dates Selling Info`,
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
    } else {
      this.createChartLine();
    }
  }

  //month wise config starts

  createMonthlyChartLine(): void {
    this.monthlySellChart = Highcharts.chart('monthly-chart-line', {
      chart: {
        type: 'line',
      },
      title: {
        text: `Monthly Selling info`,
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
          name: 'Sell',
          data: this.monthlySellDataForChart,
          visible: true,
          color: 'green',
        },
        {
          name: 'Cost',
          data: this.monthlySellDataForChart,
          visible: true,
          color: 'red',
        },
      ],
    } as any);
  }

  toggleMonthlySeries(seriesName: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const series = this.monthlySellChart?.series.find(
      (s) => s.name === seriesName
    );
    debugger;
    if (!isChecked && series) {
      // series.setVisible(isChecked, true); // Show or hide the series based on the checkbox state
      series.setData([], true);
    } else if (isChecked && series) {
      series.setData(this.monthlySellDataForChart, true);
    }
    // if (!isChecked && this.monthlySellChart) {
    //   this.monthlySellChart.series[0].setData([], true);
    // } else if (isChecked && this.monthlySellChart) {
    //   this.monthlySellChart.series[0].setData(
    //     this.monthlySellDataForChart,
    //     true
    //   );
    // }
  }

  onChangeMonth(result: Date): void {
    console.log('onChangeMonth: ', result);

    let { startDate, endDate }: any =
      this._date.getMonthStartAndEndDates(result);

    this.selectedStartDate = startDate;
    this.selectedEndDate = endDate;

    console.log(this.selectedStartDate);
    console.log(this.selectedEndDate);

    this.getSellByMonth(this.selectedStartDate, this.selectedEndDate);
  }

  getSellByMonth(startDate: string, endDate: string) {
    this.sellByMonthApiUrl = '';
    this.sellByMonthApiUrl =
      API_URL.SELL_BY_DATE_RANGE + `/${startDate}/${endDate}`;
    this.subs.push(
      this._resourceService.get<any>(this.sellByMonthApiUrl).subscribe({
        next: (res: any) => {
          console.log('sell data by date range');
          console.log(res);
          this._notificationService.success(
            'Sell data fetched successfully!',
            ''
          );
          this.monthlySellDataForChart = this.convertDataForChart(res);
          console.log(
            'this.monthlySellDataForChart',
            this.monthlySellDataForChart
          );
          this.updateMonthlyChartData();
        },
        error: (err) => {
          console.log('err', err);
        },
        complete: () => {},
      })
    );
  }

  convertMonthlyDataForChart(apiData: any[]): any[] {
    return apiData.map((item) => {
      item.date = this._formateDate.convertYYYYMMDDStringToDDMMYYYYString(
        item.date
      );
      return [item.date, item.amount];
    });
  }

  updateMonthlyChartData(): void {
    if (this.monthlySellChart) {
      this.monthlySellChart.series[0].setData(
        this.monthlySellDataForChart,
        true
      ); // Update chart data
    } else {
      this.createMonthlyChartLine();
    }
  }

  //year wise config starts

  createYearlyChartLine(): void {
    this.yearlySellChart = Highcharts.chart('yearly-chart-line', {
      chart: {
        type: 'line',
      },
      title: {
        text: `Yearly Selling Info`,
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
          data: this.yearlySellDataForChart,
        },
      ],
    } as any);
  }

  onChangeYear(result: Date): void {
    console.log('onChangeMonth: ', result);

    let year = result.getUTCFullYear();

    console.log(year.toString());

    this.getSellByYear(year.toString());
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
          this.yearlySellDataForChart = this.convertDataForYearlyChart(res);
          this.updateYearlyChartData();
        },
        error: (err) => {
          console.log('err', err);
        },
        complete: () => {},
      })
    );
  }

  convertDataForYearlyChart(apiData: any[]): any[] {
    return apiData.map((item) => {
      return [item.month, Number(item.amount)];
    });
  }

  updateYearlyChartData(): void {
    if (this.yearlySellChart) {
      this.yearlySellChart.series[0].setData(this.yearlySellDataForChart, true); // Update chart data
    } else {
      this.createYearlyChartLine();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.createChartLine();
      this.createMonthlyChartLine();
      this.createYearlyChartLine();
    }
  }
}
