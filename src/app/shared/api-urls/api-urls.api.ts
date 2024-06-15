import { environment } from '../../../environments/environment.dev';

const WEB_BASE_URL: string = `${environment.baseApiUrl}`;

export const API_URL = {
  ALL_TASKS: WEB_BASE_URL + 'tasks',
};
