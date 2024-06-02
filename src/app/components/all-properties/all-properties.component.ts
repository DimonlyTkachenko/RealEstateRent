import { Component, OnInit } from '@angular/core';
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

    RouterLink,
  ],
  templateUrl: './all-properties.component.html',
  styleUrl: './all-properties.component.scss',
})
export class AllPropertiesComponent {
  properties: any[];

  constructor(private realEstateService: RealEstateService) {}

  ngOnInit(): void {
    this.realEstateService.getAllProperties().subscribe((data) => {
      console.log(data);
      this.properties = data;
    });
  }
}
