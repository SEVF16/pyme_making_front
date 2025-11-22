import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigInitComponent } from './config-init.component';

describe('ConfigInitComponent', () => {
  let component: ConfigInitComponent;
  let fixture: ComponentFixture<ConfigInitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigInitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
