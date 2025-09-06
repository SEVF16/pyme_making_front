import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectLibComponent } from './select-lib.component';

describe('SelectLibComponent', () => {
  let component: SelectLibComponent;
  let fixture: ComponentFixture<SelectLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectLibComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
