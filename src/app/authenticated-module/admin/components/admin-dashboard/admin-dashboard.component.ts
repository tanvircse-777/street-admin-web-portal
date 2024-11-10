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

interface IndividualMinutes {
  tanvirMinutes: number;
  shakilMinutes: number;
  tarikMinutes: number;
}

interface IndividualProfits {
  tanvirProfit: number;
  shakilProfit: number;
  tarikProfit: number;
}
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements AfterViewInit {
  private subs: Subscription[] = [];

  public dateRangeSellDataForChart: any[] = [];
  public dateRangeCostDataForChart: any[] = [];
  public selectedDateRange: Date[] = [
    new Date(),
    this._date.getNextDateFromDate(new Date(), 30),
  ];
  public selectedDateRangeStartDate: string = '';
  public selectedDateRangeEndDate: string = '';
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
  public dateRangeSellCostData: any[] = [];
  public monthlySellCostSummary: SellCostSummary = {
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
    this.selectedDateRangeStartDate = this._formateDate.formatDateToYYYYMMDD(
      this.selectedDateRange[0]
    );
    this.selectedDateRangeEndDate = this._formateDate.formatDateToYYYYMMDD(
      this.selectedDateRange[1]
    );
    this.getSellCostByDateRange(
      this.selectedDateRangeStartDate,
      this.selectedDateRangeEndDate
    );
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
    Highcharts.chart('date-range-chart-line', {
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
        categories: this.getXAxisDataForChart(this.dateRangeSellDataForChart),
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
          data: this.dateRangeSellDataForChart,
          color: 'green',
        },
        {
          name: 'Cost',
          data: this.dateRangeCostDataForChart,
          color: 'red',
        },
      ],
    } as any);
  }

  onChangeDateRange(result: Date[]): void {
    console.log('onChange: ', result);
    this.selectedDateRangeStartDate = this._formateDate.formatDateToYYYYMMDD(
      this.selectedDateRange[0]
    );
    this.selectedDateRangeEndDate = this._formateDate.formatDateToYYYYMMDD(
      this.selectedDateRange[1]
    );

    this.getSellCostByDateRange(
      this.selectedDateRangeStartDate,
      this.selectedDateRangeEndDate
    );
  }

  getSellCostByDateRange(startDate: string, endDate: string) {
    this.dateRangeSellCostData = [];
    this.sellByDateRangeApiUrl = '';
    this.sellByDateRangeApiUrl =
      API_URL.SELL_COST_BY_DATE_RANGE_FOR_CHART + `/${startDate}/${endDate}`;
    this.subs.push(
      this._resourceService.get<any>(this.sellByDateRangeApiUrl).subscribe({
        next: (res: any) => {
          console.log('sell data by date range');
          console.log(res);
          this.dateRangeSellCostData = res;
          this._notificationService.success(
            'Sell data fetched successfully!',
            ''
          );

          this.dateRangeSellCostSummary =
            this.calculateDateRangeSellCostSummary(this.dateRangeSellCostData);

          this.dateRangeSellDataForChart = this.convertSellDataForChart(
            this.dateRangeSellCostData
          );
          this.dateRangeCostDataForChart = this.convertCostDataForChart(
            this.dateRangeSellCostData
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

  public attendanceData = [
    {
      date: '2024-02-01',
      tanvirInTime: '18:00',
      tanvirOutTime: '21:00',
      shakilInTime: '18:15',
      shakilOutTime: '21:00',
      tarikInTime: '20:00',
      tarikOutTime: '21:00',
    },
    {
      date: '2024-02-02',
      tanvirInTime: '18:00',
      tanvirOutTime: '21:00',
      shakilInTime: '18:15',
      shakilOutTime: '21:00',
      tarikInTime: '20:00',
      tarikOutTime: '21:00',
    },
  ];

  public RATE_PER_MINUTE = 0.83;
  public otherCostsApiUrl = '';
  public sharedMinutesData: any[] = [];
  public totalSharedMinutesData: IndividualMinutes = {
    tanvirMinutes: 0,
    shakilMinutes: 0,
    tarikMinutes: 0,
  };

  public timeBaseIndividualProfit: IndividualProfits = {
    tanvirProfit: 0,
    shakilProfit: 0,
    tarikProfit: 0,
  };
  // public timeBaseIndividualProfit: any = {
  //   tanvirProfit: 0,
  //   shakilProfit: 0,
  //   tarikProfit: 0,
  // };
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

          this.monthlySellCostSummary = this.calculateMonthlySellCostSummary(
            this.monthlySellCostData
          );

          this.getAttendanceByDateRange(
            this.selectedMonthlyStartDate,
            this.selectedMonthlyEndDate
          );
        },
        error: (err) => {
          console.log('err', err);
        },
        complete: () => {},
      })
    );
  }

  public attendanceByDateRangeApiUrl: string = '';
  public timeBaseTotalProfit: number = 0;
  getAttendanceByDateRange(startDate: string, endDate: string) {
    this.attendanceData = [];
    this.attendanceByDateRangeApiUrl = '';
    this.attendanceByDateRangeApiUrl =
      API_URL.ATTENDANCE_BY_DATE_RANGE + `/${startDate}/${endDate}`;
    this.subs.push(
      this._resourceService
        .get<any>(this.attendanceByDateRangeApiUrl)
        .subscribe({
          next: (res: any) => {
            console.log('attendance data by month');
            console.log(res);
            this.attendanceData = res;
            this._notificationService.success(
              'Attendance data fetched successfully!',
              ''
            );
            this.sharedMinutesData = this.calculateSharedMinutes(
              this.attendanceData
            );

            console.log('this.sharedMinutesData');
            console.log(this.sharedMinutesData);

            this.totalSharedMinutesData = this.calculateTotalMinutes(
              this.sharedMinutesData
            );

            console.log('this.totalSharedMinutesData');
            console.log(this.totalSharedMinutesData);

            this.timeBaseIndividualProfit = this.calculateTimeBaseProfit(
              this.totalSharedMinutesData,
              this.RATE_PER_MINUTE
            );

            console.log('this.timeBaseIndividualProfit');
            console.log(this.timeBaseIndividualProfit);

            this.timeBaseTotalProfit = this.calculateTimeBaseTotalProfit(
              this.timeBaseIndividualProfit
            );

            console.log('this.timeBaseTotalProfit');
            console.log(this.timeBaseTotalProfit);
          },
          error: (err) => {
            console.log('err', err);
          },
          complete: () => {},
        })
    );
  }

  calculateSharedMinutes(data: any) {
    return data.map((entry: any) => {
      const tanvirIn = this.timeToMinutes(entry.tanvirInTime);
      const tanvirOut = this.timeToMinutes(entry.tanvirOutTime);
      const shakilIn = this.timeToMinutes(entry.shakilInTime);
      const shakilOut = this.timeToMinutes(entry.shakilOutTime);
      const tarikIn = this.timeToMinutes(entry.tarikInTime);
      const tarikOut = this.timeToMinutes(entry.tarikOutTime);

      // Initialize minutes counters
      let tanvirMinutes = 0;
      let shakilMinutes = 0;
      let tarikMinutes = 0;

      // Loop over each minute from the earliest start time to the latest end time
      const startMinute = Math.min(tanvirIn, shakilIn, tarikIn);
      const endMinute = Math.max(tanvirOut, shakilOut, tarikOut);

      for (let minute = startMinute; minute < endMinute; minute++) {
        // Check who is present at this minute
        const isTanvirPresent = minute >= tanvirIn && minute < tanvirOut;
        const isShakilPresent = minute >= shakilIn && minute < shakilOut;
        const isTarikPresent = minute >= tarikIn && minute < tarikOut;

        const peoplePresent = [
          isTanvirPresent,
          isShakilPresent,
          isTarikPresent,
        ].filter(Boolean).length;

        // Add time divided by people present to each person's total
        if (isTanvirPresent) tanvirMinutes += 1 / peoplePresent;
        if (isShakilPresent) shakilMinutes += 1 / peoplePresent;
        if (isTarikPresent) tarikMinutes += 1 / peoplePresent;
      }

      return {
        date: entry.date,
        tanvirMinutes: Math.round(tanvirMinutes),
        shakilMinutes: Math.round(shakilMinutes),
        tarikMinutes: Math.round(tarikMinutes),
      };
    });
  }

  timeToMinutes(time: any) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  calculateTimeBaseProfit(data: any, ratePerMinute: any) {
    const totalMinutes = data;

    return {
      tanvirProfit: Number(
        (totalMinutes.tanvirMinutes * ratePerMinute).toFixed(2)
      ),
      shakilProfit: Number(
        (totalMinutes.shakilMinutes * ratePerMinute).toFixed(2)
      ),
      tarikProfit: Number(
        (totalMinutes.tarikMinutes * ratePerMinute).toFixed(2)
      ),
    };
  }

  calculateTotalMinutes(data: any) {
    return data.reduce(
      (totals: any, entry: any) => {
        totals.tanvirMinutes += entry.tanvirMinutes;
        totals.shakilMinutes += entry.shakilMinutes;
        totals.tarikMinutes += entry.tarikMinutes;
        return totals;
      },
      { tanvirMinutes: 0, shakilMinutes: 0, tarikMinutes: 0 }
    );
  }

  calculateTimeBaseTotalProfit(profits: any) {
    let totalProfit = 0;
    for (let key in profits) {
      totalProfit += profits[key];
    }
    return Number(totalProfit.toFixed(2));
  }

  calculateMonthlySellCostSummary(data: SellCostData[]): SellCostSummary {
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
