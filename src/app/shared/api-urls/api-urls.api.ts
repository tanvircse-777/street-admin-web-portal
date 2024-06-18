import { environment } from '../../../environments/environment.dev';

const WEB_BASE_URL: string = `${environment.baseApiUrl}`;

export const API_URL = {
  ALL_FEEDBACK: WEB_BASE_URL + 'feedback',
  CREATE_FEEDBACK: WEB_BASE_URL + 'feedback',
  CUSTOMER_INFO_BY_EMAIL: WEB_BASE_URL + 'customer/info',
};
