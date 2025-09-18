import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComputadorasComponent } from './computadoras.component';

describe('ComputadorasComponent', () => {
  let component: ComputadorasComponent;
  let fixture: ComponentFixture<ComputadorasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComputadorasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComputadorasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
