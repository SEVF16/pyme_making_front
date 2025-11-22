import { ComponentFixture, TestBed } from '@angular/core/testing';

import { POSSessionOpenComponent } from './pos-session-open.component';

describe('POSSessionOpenComponent', () => {
  let component: POSSessionOpenComponent;
  let fixture: ComponentFixture<POSSessionOpenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [POSSessionOpenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(POSSessionOpenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
