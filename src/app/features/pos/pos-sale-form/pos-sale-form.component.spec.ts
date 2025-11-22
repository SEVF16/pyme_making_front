import { ComponentFixture, TestBed } from '@angular/core/testing';

import { POSSaleFormComponent } from './pos-sale-form.component';

describe('POSSaleFormComponent', () => {
  let component: POSSaleFormComponent;
  let fixture: ComponentFixture<POSSaleFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [POSSaleFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(POSSaleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
