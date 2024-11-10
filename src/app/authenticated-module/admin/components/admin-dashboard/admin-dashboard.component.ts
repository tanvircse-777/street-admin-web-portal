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

interface MonthlySellCostSummary {
  totalSell: number;
  totalCost: number;
  averageSell: number;
  averageCost: number;
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

  public sellDataForChart: any[] = [];
  public costDataForChart: any[] = [];
  public selectedDateRange: Date[] = [
    new Date(),
    this._date.getNextDateFromDate(new Date(), 30),
  ];
  public selectedStartDate: string = '';
  public selectedEndDate: string = '';
  public sellByDateRangeApiUrl: string = '';

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

  public showOtherCosts: boolean = false;
  public otherCostsDetail: OtherCosts[] = [];
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

  public dateRangeSellCostSummary: MonthlySellCostSummary = {
    totalSell: 0,
    totalCost: 0,
    averageSell: 0,
    averageCost: 0,
  };

  public selectedMonthlyStartDate: string = '';
  public selectedMonthlyEndDate: string = '';
  public monthlySellCostData: any[] = [];
  public monthlyCostDataForChart: any = [];

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
      // this.getInitialYearlySellData();
    }
  }

  time = new Date();

  onChangeTimePicker() {
    console.log(this.time);
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

  //date range wise config starts
  createDateRangeChartLine(): void {
    Highcharts.chart('chart-line', {
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
        categories: this.getXAxisDataForChart(this.sellDataForChart),
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

    this.getSellByDateRange(this.selectedStartDate, this.selectedEndDate);
  }

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
          this._notificationService.success(
            'Sell data fetched successfully!',
            ''
          );

          this.dateRangeSellCostSummary = this.calculateDateRangeSellCostSummary(
            this.sellCostData
          );

          this.sellDataForChart = this.convertSellDataForChart(
            this.sellCostData
          );
          this.costDataForChart = this.convertCostDataForChart(
            this.sellCostData
          );

          this.createDateRangeChartLine();
        },
        error: (err) => {
          console.log('err', err);
        },
        complete: () => {},
      })
    );
  }

  calculateDateRangeSellCostSummary(
    data: SellCostData[]
  ): MonthlySellCostSummary {
    debugger;
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

    return {
      totalSell,
      totalCost,
      averageSell,
      averageCost,
    };
  }

  //month wise config starts
  createMonthlyChartLine(): void {
    Highcharts.chart('monthly-chart-line', {
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
        categories: this.getXAxisDataForChart(this.monthlySellDataForChart),
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
          data: this.monthlySellDataForChart,
          color: 'green',
        },
        {
          name: 'Cost',
          data: this.monthlyCostDataForChart,
          color: 'red',
        },
      ],
    } as any);
  }

  onChangeMonth(result: Date): void {
    console.log('onChangeMonth: ', result);

    let { startDate, endDate }: any =
      this._date.getMonthStartAndEndDates(result);

    this.selectedMonthlyStartDate = startDate;
    this.selectedMonthlyEndDate = endDate;

    this.getSellByMonth(
      this.selectedMonthlyStartDate,
      this.selectedMonthlyEndDate
    );
  }

  getSellByMonth(startDate: string, endDate: string) {
    this.monthlySellCostData = [];
    this.sellByDateRangeApiUrl = '';
    this.sellByDateRangeApiUrl =
      API_URL.SELL_COST_BY_DATE_RANGE_FOR_CHART + `/${startDate}/${endDate}`;
    this.subs.push(
      this._resourceService.get<any>(this.sellByDateRangeApiUrl).subscribe({
        next: (res: any) => {
          console.log('sell data by month');
          console.log(res);
          this.monthlySellCostData = res;
          this._notificationService.success(
            'Sell data fetched successfully!',
            ''
          );
          this.monthlySellDataForChart = this.convertSellDataForChart(
            this.monthlySellCostData
          );
          this.monthlyCostDataForChart = this.convertCostDataForChart(
            this.monthlySellCostData
          );

          this.createMonthlyChartLine();

          let month =
            this._formateDate.convertYYYYMMDDStringToYYYYMMString(startDate);
          console.log(month);
          this.getOtherCostsByMonth(month);
        },
        error: (err) => {
          console.log('err', err);
        },
        complete: () => {},
      })
    );
  }

  public otherCostsApiUrl = '';
  getOtherCostsByMonth(month: string) {
    this.otherCostsDetail = [];
    this.otherCostsApiUrl = '';
    this.otherCostsApiUrl = API_URL.OTHER_COSTS_BY_MONTH + `/${month}`;
    this.subs.push(
      this._resourceService.get<any>(this.otherCostsApiUrl).subscribe({
        next: (res: any) => {
          console.log('other costs data by month');
          console.log(res);
          this.otherCostsDetail = res;

          this._notificationService.success(
            'Other Costs data fetched successfully!',
            ''
          );

          this.sellCostSummary = this.calculateSellCostSummary(
            this.monthlySellCostData
          );
        },
        error: (err) => {
          console.log('err', err);
        },
        complete: () => {},
      })
    );
  }

  calculateSellCostSummary(data: SellCostData[]): SellCostSummary {
    debugger;
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

  toggleOtherCosts() {
    this.showOtherCosts = !this.showOtherCosts;
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
      // this.createYearlyChartLine();
    }
  }
}
