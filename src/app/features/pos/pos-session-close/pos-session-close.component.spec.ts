import { ComponentFixture, TestBed } from '@angular/core/testing';

import { POSSessionCloseComponent } from './pos-session-close.component';

describe('POSSessionCloseComponent', () => {
  let component: POSSessionCloseComponent;
  let fixture: ComponentFixture<POSSessionCloseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [POSSessionCloseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(POSSessionCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
