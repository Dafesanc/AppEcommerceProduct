import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvHomeComponent } from './tv-home.component';

describe('TvHomeComponent', () => {
  let component: TvHomeComponent;
  let fixture: ComponentFixture<TvHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TvHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TvHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
