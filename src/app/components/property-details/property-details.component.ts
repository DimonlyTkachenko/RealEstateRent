import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RealEstateService } from '../../services/real-estate.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CarouselComponent,
  CarouselControlComponent,
  CarouselIndicatorsComponent,
  CarouselInnerComponent,
  CarouselItemComponent,
  ThemeDirective,
} from '@coreui/angular';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Property } from '../../entities/property';
import { LoaderComponent } from '../common/loader/loader.component';
import { LoaderService } from '../../services/loader.service';
import { Comment } from '../../entities/comment';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    ReactiveFormsModule,
    CarouselIndicatorsComponent,
    CarouselInnerComponent,
    CarouselItemComponent,
    LoaderComponent,
    CommonModule,
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
  bookingForm: FormGroup;
  commentForm: FormGroup;
  slides: { title: string; src: string }[] = [];
  isUserOwner: boolean;
  canLeaveComments: boolean = true; // for now
  commentsLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private realEstateService: RealEstateService,
    private fb: FormBuilder,
    private loaderService: LoaderService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const propertyId = this.route.snapshot.paramMap.get('id');
    if (propertyId) {
      this.realEstateService.getPropertyById(propertyId).subscribe((data) => {
        this.property = data as Property;
        console.log(this.property);
        this.isUserOwner = this.realEstateService.getUserAccountId() === this.property.owner;
        this.slides = this.property.images.map((el) => {
          return { title: 'No image', src: el };
        });

        this.realEstateService.getPropertyComments(this.property.id).subscribe((data) => {
          this.property.comments = this.realEstateService.sortByDate(data || []);
          console.log(this.property);
          this.commentsLoaded = true;
        });
      });
    }

    this.bookingForm = this.fb.group(
      {
        checkIn: ['', [Validators.required, this.dateInPastValidator]],
        checkOut: ['', [Validators.required, this.dateInPastValidator]],
      },
      { validators: this.checkOutAfterCheckInValidator }
    );

    this.commentForm = this.fb.group({
      text: ['', Validators.required],
    });
  }

  dateInPastValidator(control: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(control.value);
    if (date < today) {
      return { dateInPast: true };
    }
    return null;
  }

  checkOutAfterCheckInValidator(group: FormGroup) {
    const checkIn = new Date(group.controls['checkIn'].value).getTime();
    const checkOut = new Date(group.controls['checkOut'].value).getTime();
    console.log('checking: ' + checkIn);
    console.log('checkout: ' + checkOut);
    if (checkOut <= checkIn) {
      console.log('date invalid!!!');
      return { checkOutBeforeCheckIn: true };
    }
    return null;
  }

  onBook() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.booking.checkIn && this.booking.checkOut) {
      const checkInDate = new Date(this.booking.checkIn);
      const checkOutDate = new Date(this.booking.checkOut);

      if (checkInDate < today) {
        console.error('Check-in date cannot be in the past.');
        return;
      }

      if (checkOutDate <= checkInDate) {
        console.error('Check-out date must be greater than check-in date.');
        return;
      }

      console.log('Booking property from ' + this.booking.checkIn + ' to ' + this.booking.checkOut);
      // Implement booking logic here
    } else {
      console.error('Form is invalid');
    }
  }

  async onSubmitComment() {
    if (this.commentForm.valid) {
      const newComment = {
        text: this.commentForm.value.text,
        propertyId: this.property.id,
      };

      this.loaderService.show();
      const response = await this.realEstateService.createComment(newComment);
      this.loaderService.hide();
      const msg = response?.error ? response?.error : 'Comment was posted.';
      this.snackBar.open(msg, 'Close', {
        duration: 2000,
      });

      // setTimeout(() => {
      //   window.location.reload();
      // }, 2100);
    }
  }
}
