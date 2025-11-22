import { ComponentFixture, TestBed } from '@angular/core/testing';

import { POSSessionsComponent } from './pos-sessions.component';

describe('POSSessionsComponent', () => {
  let component: POSSessionsComponent;
  let fixture: ComponentFixture<POSSessionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [POSSessionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(POSSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
