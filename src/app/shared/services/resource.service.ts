import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export abstract class ResourceService {
  constructor(private httpClient: HttpClient) {}

  get<Response>(apiUrl: string): Observable<Response> {
    return this.httpClient.get<Response>(`${apiUrl}`).pipe(
      map((json) => json),
      catchError(this.handleError)
    );
  }

  getWithParams<Response>(param: any, apiUrl: string): Observable<Response> {
    let params: any = new HttpParams();

    Object.keys(param).forEach((key) => {
      let value = param[key] ?? '';
      params = params.append(key, value);
    });

    return this.httpClient
      .get<Response>(`${apiUrl}?${params.toString()}`)
      .pipe(catchError(this.handleError));
  }

  getWithUrlParam<Response>(
    apiUrl: string,
    urlParam: any
  ): Observable<Response> {
    return this.httpClient.get<Response>(`${apiUrl}/${urlParam}`).pipe(
      map((json) => json),
      catchError(this.handleError)
    );
  }

  post<Request, Response>(
    request: Request,
    apiUrl: string
  ): Observable<Response> {
    return this.httpClient
      .post<Response>(`${apiUrl}`, request)
      .pipe(catchError(this.handleError));
  }

  postWithParams<Request, Response>(
    request: Request,
    param: any,
    apiUrl: string
  ): Observable<Response> {
    let params: any = new HttpParams();

    Object.keys(param).forEach((key) => {
      let value = param[key] ?? '';
      params = params.append(key, value);
    });

    return this.httpClient
      .post<Response>(`${apiUrl}?${params.toString()}`, request)
      .pipe(catchError(this.handleError));
  }

  patch<Request, Response>(
    request: Request,
    apiUrl: string
  ): Observable<Response> {
    return this.httpClient
      .patch<Response>(apiUrl, request)
      .pipe(catchError(this.handleError));
  }

  put<Request, Response>(
    request: Request,
    apiUrl: string
  ): Observable<Response> {
    return this.httpClient
      .put<Response>(`${apiUrl}`, request)
      .pipe(catchError(this.handleError));
  }

  delete<Response>(apiUrl: string): Observable<Response> {
    return this.httpClient
      .delete<Response>(`${apiUrl}`)
      .pipe(catchError(this.handleError));
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    return throwError(() => {
      return error;
    });
  }
}
