import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomAmountModalComponent } from './custom-amount-modal.component';

describe('CustomAmountModalComponent', () => {
  let component: CustomAmountModalComponent;
  let fixture: ComponentFixture<CustomAmountModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomAmountModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomAmountModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
