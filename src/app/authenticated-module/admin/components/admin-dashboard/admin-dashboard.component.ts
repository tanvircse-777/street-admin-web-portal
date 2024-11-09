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

interface SellCostData {
  date: string;
  databaseDateFormat: string;
  sell: number | null;
  cost: number | null;
}

interface SellCostSummary {
  totalSell: number;
  totalCost: number;
  averageSell: number;
  averageCost: number;
  otherCosts: OtherCosts[];
  totalOtherCosts: 0;
  averageProfit: number;
  totalProfit: number;
  profitPerPerson: number;
  finalProfit: number;
}

interface OtherCosts {
  title: string;
  amount: number;
}
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements AfterViewInit {
  private subs: Subscription[] = [];

  private sellChart: Highcharts.Chart | null = null;
  public sellDataForChart: any[] = [];
  public costDataForChart: any[] = [];
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
        enabled: true,
      },
      yAxis: {
        title: {
          text: 'Amount(BDT)',
        },
      },
      xAxis: {
        title: {
          text: 'Date',
        },
        categories:
          // [
          //   'Jan',
          //   'Feb',
          //   'Mar',
          //   'Apr',
          //   'May',
          //   'Jun',
          //   'Jul',
          //   'Aug',
          //   'Sep',
          //   'Oct',
          //   'Nov',
          //   'Dec',
          // ],
          this.getXAxisDataForChart(this.sellDataForChart),
        accessibility: {
          description: 'Months of the year',
        },
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
          data: this.sellDataForChart,
          color: 'green',
        },
        {
          name: 'Cost',
          data: this.costDataForChart,
          color: 'red',
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

  // otherCosts: {
  //   rubelVai: 15000,
  //   rahat: 6500,
  //   jomidar: 2000,
  //   wifi: 600,
  //   lastMonthBazar: 11000,
  // }'
  toggleOtherCosts() {
    this.showOtherCosts = !this.showOtherCosts;
  }
  public showOtherCosts: boolean = false;
  public otherCostsDetail: OtherCosts[] = [
    {
      title: 'Rubel Vai Salary',
      amount: 15000,
    },
    {
      title: 'Rubel Vai Bonus',
      amount: 2000,
    },
    {
      title: "Rahat's Salary",
      amount: 6000,
    },
    {
      title: "Shakil's Bonus",
      amount: 2000,
    },
    {
      title: 'Jomidar',
      amount: 2000,
    },
    {
      title: 'Wifi Bill',
      amount: 600,
    },
    {
      title: "Next Month's First Day Bazar",
      amount: 22190,
    },
  ];
  public sellCostData: any[] = [];
  public sellCostSummary: SellCostSummary = {
    totalSell: 0,
    totalCost: 0,
    averageSell: 0,
    averageCost: 0,
    averageProfit: 0,
    totalProfit: 0,
    finalProfit: 0,
    profitPerPerson: 0,
    otherCosts: this.otherCostsDetail,

    totalOtherCosts: 0,
  };
  getSellByDateRange(startDate: string, endDate: string) {
    this.sellCostData = [];
    this.sellByDateRangeApiUrl = '';
    this.sellByDateRangeApiUrl =
      API_URL.SELL_COST_BY_DATE_RANGE_FOR_CHART + `/${startDate}/${endDate}`;
    this.subs.push(
      this._resourceService.get<any>(this.sellByDateRangeApiUrl).subscribe({
        next: (res: any) => {
          console.log('sell data by date range');
          console.log(res);
          this.sellCostData = res;
          this.sellCostSummary = this.calculateSellCostSummary(
            this.sellCostData
          );
          this._notificationService.success(
            'Sell data fetched successfully!',
            ''
          );
          this.sellDataForChart = this.convertSellDataForChart(
            this.sellCostData
          );
          this.costDataForChart = this.convertCostDataForChart(
            this.sellCostData
          );

          this.createChartLine();
          console.log('this.sellDataForChart', this.sellDataForChart);
          // this.updateChartData();
        },
        error: (err) => {
          console.log('err', err);
        },
        complete: () => {},
      })
    );
  }

  calculateSellCostSummary(data: SellCostData[]): SellCostSummary {
    const validSellData = data.filter((item) => item.sell !== null);

    const validCostData = data.filter((item) => item.cost !== null);

    const totalSell = validSellData.reduce(
      (sum, item) => sum + (item.sell || 0),
      0
    );
    const totalCost = validCostData.reduce(
      (sum, item) => sum + (item.cost || 0),
      0
    );

    const averageSell = validSellData.length
      ? totalSell / validSellData.length
      : 0;
    const averageCost = validCostData.length
      ? totalCost / validCostData.length
      : 0;

    const otherCosts: OtherCosts[] = this.otherCostsDetail;

    const totalOtherCosts: any = this.calculateTotalOtherCosts(
      this.otherCostsDetail
    );

    const averageProfit = averageSell - averageCost;
    const totalProfit = totalSell - totalCost;
    const finalProfit = totalProfit - totalOtherCosts;
    const profitPerPerson = finalProfit / 4;

    return {
      totalSell,
      totalCost,
      averageSell,
      averageCost,
      otherCosts,
      totalOtherCosts,
      averageProfit,
      totalProfit,
      finalProfit,
      profitPerPerson,
    };
  }

  calculateTotalOtherCosts(costs: OtherCosts[]): number {
    return costs.reduce((sum, cost) => sum + cost.amount, 0);
  }

  convertSellDataForChart(apiData: any[]): any[] {
    return apiData.map((item) => {
      item.date = this._formateDate.convertYYYYMMDDStringToDDMMYYYYString(
        item.date
      );
      return [item.date, item.sell];
    });
  }

  convertCostDataForChart(apiData: any[]): any[] {
    return apiData.map((item) => {
      item.date = this._formateDate.convertYYYYMMDDStringToDDMMYYYYString(
        item.date
      );
      return [item.date, item.cost];
    });
  }

  getXAxisDataForChart(data: any[]): any[] {
    console.log('from x axis');
    console.log(data);
    return data.map((item) => {
      return [item[0]];
    });
  }

  updateChartData(): void {
    if (this.sellChart) {
      this.sellChart.series[0].setData(this.sellDataForChart, true);
      this.sellChart.series[1].setData(this.costDataForChart, true);
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
  }

  onChangeMonth(result: Date): void {
    console.log('onChangeMonth: ', result);

    let { startDate, endDate }: any =
      this._date.getMonthStartAndEndDates(result);

    this.selectedStartDate = startDate;
    this.selectedEndDate = endDate;

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

  convertDataForChart(apiData: any[]): any[] {
    return apiData.map((item) => {
      item.date = this._formateDate.convertYYYYMMDDStringToDDMMYYYYString(
        item.date
      );
      return [item.date, item.sell];
    });
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
      // this.createChartLine();
      this.createMonthlyChartLine();
      this.createYearlyChartLine();
    }
  }
}
