import { ComponentFixture, TestBed } from '@angular/core/testing';

import { POSSalesComponent } from './pos-sales.component';

describe('POSSalesComponent', () => {
  let component: POSSalesComponent;
  let fixture: ComponentFixture<POSSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [POSSalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(POSSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
