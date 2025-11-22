import { ComponentFixture, TestBed } from '@angular/core/testing';

import { POSSaleDetailComponent } from './pos-sale-detail.component';

describe('POSSaleDetailComponent', () => {
  let component: POSSaleDetailComponent;
  let fixture: ComponentFixture<POSSaleDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [POSSaleDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(POSSaleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
