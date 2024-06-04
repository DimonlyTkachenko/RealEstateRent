import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RealEstateService } from '../../services/real-estate.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-all-properties',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './all-properties.component.html',
  styleUrls: ['./all-properties.component.scss'],
})
export class AllPropertiesComponent implements OnInit {
  properties: any[] = [];
  filteredProperties: any[] = [];
  filterForm: FormGroup;

  constructor(private realEstateService: RealEstateService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      location: [''],
      type: [''],
      minBudget: [''],
      maxBudget: [''],
      rentOrder: [''],
    });
  }

  ngOnInit(): void {
    this.realEstateService.getAllProperties().subscribe((data) => {
      this.properties = data;
      this.filteredProperties = data;
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const { location, type, minBudget, maxBudget, rentOrder } = this.filterForm.value;
    this.filteredProperties = this.properties.filter((property) => {
      return (
        (location ? property.location.toLowerCase().includes(location.toLowerCase()) : true) &&
        (type && property.type ? property.type.toLowerCase().includes(type.toLowerCase()) : true) &&
        (minBudget ? property.price >= minBudget : true) &&
        (maxBudget ? property.price <= maxBudget : true)
      );
    });

    if (rentOrder) {
      this.filteredProperties.sort((a, b) => {
        if (rentOrder === 'low-high') {
          return a.price - b.price;
        } else if (rentOrder === 'high-low') {
          return b.price - a.price;
        }
        return 0;
      });
    }
  }

  clearFilters(): void {
    this.filterForm.reset();
  }
}
