import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private activeRequests = 0;
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  show(): void {
    this.activeRequests++;
    if (this.activeRequests > 0) {
      setTimeout(() => {
        if (this.activeRequests > 0) {
          this.isLoadingSubject.next(true);
        }
      }, 0);
    }
  }

  hide(): void {
    if (this.activeRequests > 0) {
      this.activeRequests--;
    }
    if (this.activeRequests === 0) {
      setTimeout(() => {
        if (this.activeRequests === 0) {
          this.isLoadingSubject.next(false);
        }
      }, 0);
    }
  }

  reset(): void {
    this.activeRequests = 0;
    setTimeout(() => {
      this.isLoadingSubject.next(false);
    }, 0);
  }
}
