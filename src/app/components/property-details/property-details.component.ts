import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RealEstateService } from '../../services/real-estate.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmBookingComponent } from './booking-confirmation/confirm-booking/confirm-booking.component';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CarouselComponent,
  CarouselControlComponent,
  CarouselIndicatorsComponent,
  CarouselInnerComponent,
  CarouselItemComponent,
  ThemeDirective,
} from '@coreui/angular';

import { Property } from '../../entities/property';
import { LoaderComponent } from '../common/loader/loader.component';
import { LoaderService } from '../../services/loader.service';
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
  canLeaveComments: boolean; // for now
  commentsLoaded = false;
  bookedDates: Date[] = [];
  nearToUsd: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private realEstateService: RealEstateService,
    private fb: FormBuilder,
    private loaderService: LoaderService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const propertyId = this.route.snapshot.paramMap.get('id');
    const trnHash = this.route.snapshot.queryParamMap.get('transactionHashes');

    this.realEstateService.nearToUsd$.subscribe((value) => {
      this.nearToUsd = value;
    });

    if (propertyId) {
      this.realEstateService.getPropertyById(propertyId).subscribe((data) => {
        this.property = data as Property;
        this.isUserOwner = this.realEstateService.getUserAccountId() === this.property.owner;

        this.canLeaveComments = !this.isUserOwner;
        this.slides = this.property.images.map((el) => {
          return { title: 'No image', src: el };
        });

        this.realEstateService.getPropertyComments(this.property.id).subscribe((data) => {
          this.property.comments = this.realEstateService.sortByDate(data || []);

          this.commentsLoaded = true;
        });

        this.realEstateService.getPropertyBookings(this.property.id).subscribe((data) => {
          this.bookedDates = this.mapAndPrepareBookedDates(data);
        });
      });

      // handle case when payable transaction is finished to retrieve result
      if (trnHash) {
        this.loaderService.show();
        this.realEstateService.getTranasctionResult(trnHash).subscribe((data) => {
          this.loaderService.hide();
          const msg = data.error ? data.error : 'Booking was successful!';
          this.snackBar.open(msg, 'Close', {
            duration: 2000,
          });

          this.navigateByRoute('my-bookings', 2200);
        });
      }
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

  mapAndPrepareBookedDates(bookings: any[]): Date[] {
    const resultingDates = [];

    for (let booking of bookings) {
      try {
        const startDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);
        let loopDate = startDate;
        if (loopDate <= endDate) {
          while (loopDate <= endDate) {
            resultingDates.push(new Date(loopDate));
            loopDate.setDate(loopDate.getDate() + 1);
          }
        } else {
          throw new Error('Fatal booking error! ' + JSON.stringify(booking));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return resultingDates;
  }

  onBook() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.booking.checkIn && this.booking.checkOut) {
      const checkInDate = new Date(this.booking.checkIn);
      const checkOutDate = new Date(this.booking.checkOut);

      if (checkInDate < today) {
        console.error('Check-in date cannot be in the past.');
        alert('validation error.');
        return;
      }

      if (checkOutDate <= checkInDate) {
        console.error('Check-out date must be greater than check-in date.');
        alert('validation error.');
        return;
      }

      console.log(
        'Booking property from ' +
          this.booking.checkIn.toLocaleDateString('en-CA') +
          ' to ' +
          this.booking.checkOut.toLocaleDateString('en-CA')
      );
      const days_between = (d1: Date, d2: Date): number => {
        const ONE_DAY = 1000 * 60 * 60 * 24;
        const differenceMs = Math.abs(d1.getTime() - d2.getTime());
        return Math.round(differenceMs / ONE_DAY);
      };

      const totalDays = days_between(this.booking.checkIn, this.booking.checkOut);
      const totalUsd = (Number(this.property.price || 0) * +totalDays).toString();

      const totalNear = this.convertUsdToNear(totalUsd);
      const totalCost = this.realEstateService.parseNearAmount(totalNear);

      const dialogRef = this.dialog.open(ConfirmBookingComponent, {
        maxWidth: '1000px',
        data: {
          propertyTitle: this.property.title,
          propertyOwner: this.property.owner,
          propertyPrice: this.property.price,
          propertyLocation: this.property.location,
          checkIn: this.booking.checkIn,
          checkOut: this.booking.checkOut,
          totalCost: `$${totalUsd} ≈ ${Number(totalNear).toFixed(4)} NEAR`,
          totalDays,
        },
      });
      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          this.loaderService.show();
          const res = await this.realEstateService.createBooking({
            propertyId: this.property.id,
            startDate: this.booking.checkIn.toISOString(),
            endDate: this.booking.checkOut.toISOString(),
            bookingTotal: totalCost,
            fullBookedDays: totalDays,
            totalUsd,
          });
          this.loaderService.hide();
        } else {
        }
      });
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
      if (response && response.status) {
        const msg = response?.error ? response?.error : 'Comment was posted.';
        this.snackBar.open(msg, 'Close', {
          duration: 3000,
        });

        setTimeout(() => {
          window.location.reload();
        }, 3100);
      }
    }
  }

  // dates validation logic

  dateInPastValidator(control: FormControl): { [key: string]: boolean } | null {
    const date = new Date(control.value);
    return date < new Date() ? { dateInPast: true } : null;
  }

  checkOutAfterCheckInValidator(group: FormGroup): { [key: string]: boolean } | null {
    const checkIn = new Date(group.controls['checkIn'].value);
    const checkOut = new Date(group.controls['checkOut'].value);
    return checkOut <= checkIn ? { checkOutBeforeCheckIn: true } : null;
  }

  checkInDateFilter = (d: Date | null): boolean => {
    const date = d || new Date();
    return !this.isDateBooked(date) && !this.isDateInPast(date);
  };

  checkOutDateFilter = (d: Date | null): boolean => {
    const date = d || new Date();
    const checkInDate = new Date(this.bookingForm?.get('checkIn')?.value || '');
    return !this.isDateBooked(date) && !this.isDateInPast(date) && (!checkInDate || date > checkInDate);
  };

  isDateBooked(date: Date): boolean {
    const dateString = date.toLocaleDateString('en-CA'); // Use 'en-CA' for 'YYYY-MM-DD' format
    const bookedDatesStrings = this.bookedDates.map((bookedDate) => bookedDate.toLocaleDateString('en-CA'));

    // Check if the date is booked
    if (bookedDatesStrings.includes(dateString)) {
      return true;
    }

    // Check if the date is a one-day gap between booked dates
    return this.isOneDayGap(date);
  }

  isOneDayGap(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prevDay = new Date(date);
    prevDay.setDate(date.getDate() - 1);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const prevDayBooked = this.bookedDates.some(
      (bookedDate) => bookedDate.toLocaleDateString('en-CA') === prevDay.toLocaleDateString('en-CA')
    );

    const nextDayBooked = this.bookedDates.some(
      (bookedDate) => bookedDate.toLocaleDateString('en-CA') === nextDay.toLocaleDateString('en-CA')
    );

    if (date.getTime() === today.getTime() && nextDayBooked) {
      return true;
    }

    return prevDayBooked && nextDayBooked;
  }

  isDateInPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  convertUsdToNear(dollars: string): string {
    return dollars ? +dollars / this.nearToUsd + '' : '0';
  }

  /**
   * Navigates to specified route after timeout
   * @param route string route to navigate
   * @param timeout in ms for setTimeout
   */
  navigateByRoute(route: string, timeout: number = 2000) {
    setTimeout(() => {
      this.router.navigate([route]);
    }, timeout);
  }
}
