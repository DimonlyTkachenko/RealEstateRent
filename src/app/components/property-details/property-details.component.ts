import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RealEstateService } from '../../services/real-estate.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import {
  CarouselComponent,
  CarouselControlComponent,
  CarouselIndicatorsComponent,
  CarouselInnerComponent,
  CarouselItemComponent,
  ThemeDirective,
} from '@coreui/angular';

import { FormsModule } from '@angular/forms';
import { Property } from '../../entities/property';

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatCardModule,
    CarouselComponent,
    CarouselControlComponent,
    CarouselIndicatorsComponent,
    CarouselInnerComponent,
    CarouselItemComponent,
    ThemeDirective,
    RouterLink,
    NgFor,
    NgIf,
  ],
  providers: [MatDatepickerModule],
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.scss'],
})
export class PropertyDetailsComponent implements OnInit {
  property: Property;
  booking: any = {};
  slides: { title: string; src: string }[] = [];
  isUserOwner: boolean;

  constructor(private route: ActivatedRoute, private realEstateService: RealEstateService) {}

  ngOnInit(): void {
    const propertyId = this.route.snapshot.paramMap.get('id');
    if (propertyId) {
      this.realEstateService.getPropertyById(propertyId).subscribe((data) => {
        this.property = data as Property;
        this.isUserOwner = this.realEstateService.getUserAccountId() === this.property.owner;
        this.slides = this.property.images.map((el) => {
          return { title: 'No image', src: el };
        });
      });
    }
  }

  onBook() {
    if (this.booking.checkIn && this.booking.checkOut) {
      console.log('Booking property from ' + this.booking.checkIn + ' to ' + this.booking.checkOut);
      // Implement booking logic here
    } else {
      console.error('Form is invalid');
    }
  }
}
