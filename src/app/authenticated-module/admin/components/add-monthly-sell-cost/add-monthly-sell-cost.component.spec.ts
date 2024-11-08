import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMonthlySellCostComponent } from './add-monthly-sell-cost.component';

describe('AddMonthlySellCostComponent', () => {
  let component: AddMonthlySellCostComponent;
  let fixture: ComponentFixture<AddMonthlySellCostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMonthlySellCostComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddMonthlySellCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
