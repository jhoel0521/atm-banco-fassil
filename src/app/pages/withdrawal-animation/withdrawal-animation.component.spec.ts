import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawalAnimationComponent } from './withdrawal-animation.component';

describe('WithdrawalAnimationComponent', () => {
  let component: WithdrawalAnimationComponent;
  let fixture: ComponentFixture<WithdrawalAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WithdrawalAnimationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WithdrawalAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
