import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMonthlyAttendanceComponent } from './add-monthly-attendance.component';

describe('AddMonthlyAttendanceComponent', () => {
  let component: AddMonthlyAttendanceComponent;
  let fixture: ComponentFixture<AddMonthlyAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMonthlyAttendanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddMonthlyAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
