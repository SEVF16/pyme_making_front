import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocompleteLibComponent } from './autocomplete-lib.component';

describe('AutocompleteLibComponent', () => {
  let component: AutocompleteLibComponent;
  let fixture: ComponentFixture<AutocompleteLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocompleteLibComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutocompleteLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
