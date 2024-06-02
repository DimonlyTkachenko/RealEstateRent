import { Component, OnInit } from '@angular/core';
import { RealEstateService } from '../../services/real-estate.service';
import { CommonModule } from '@angular/common';
import { PropertyListComponent } from '../property-list/property-list.component';

@Component({
  selector: 'app-all-properties',
  standalone: true,
  imports: [PropertyListComponent, CommonModule],
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
