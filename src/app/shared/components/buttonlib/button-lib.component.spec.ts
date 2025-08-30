import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonLibComponent } from './button-lib.component';

describe('ButtonlibComponent', () => {
  let component: ButtonLibComponent;
  let fixture: ComponentFixture<ButtonLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonLibComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
