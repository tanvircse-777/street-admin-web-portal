import { environment } from '../../../environments/environment.dev';

const WEB_BASE_URL: string = `${environment.baseApiUrl}`;

export const API_URL = {
  ALL_FEEDBACK: WEB_BASE_URL + 'feedback',
  CREATE_FEEDBACK: WEB_BASE_URL + 'feedback',
  CREATE_CUSTOMER: WEB_BASE_URL + 'customer',
  CUSTOMER_INFO_BY_EMAIL: WEB_BASE_URL + 'customer/info',
  IS_CUSTOMER_EXIST: WEB_BASE_URL + 'customer/is-customer-exist',
  SELL_BY_DATE_RANGE: WEB_BASE_URL + 'sell/by-date-range',
  SELL_BY_YEAR: WEB_BASE_URL + 'sell/by-year',
  CREATE_OR_UPDATE_SELL: WEB_BASE_URL + 'sell-cost/create-or-update',
  SELL_COST_BY_DATE_RANGE: WEB_BASE_URL + 'sell-cost/by-date-range',
};
