import { Component, OnInit } from '@angular/core';
import { Property } from '../../entities/property';
import { LoaderComponent } from '../common/loader/loader.component';
import { LoaderService } from '../../services/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { RealEstateService } from '../../services/real-estate.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { DialogComponent } from '../common/dialog/dialog.component';

@Component({
  selector: 'app-user-bookings-list',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LoaderComponent, MatButtonModule],
  templateUrl: './user-bookings-list.component.html',
  styleUrl: './user-bookings-list.component.scss',
})
export class UserBookingsListComponent {
  userBookings: any[];

  constructor(
    private realEstateService: RealEstateService,
    private loaderService: LoaderService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.realEstateService.getUserBookings().subscribe((data) => {
      const bookings = data;
      for (let booking of bookings) {
        booking.canBeCancelled = this.bookingCanBeCancelled(booking?.start);
      }
      this.userBookings = bookings;
    });
  }

  bookingCanBeCancelled(startDate: string): boolean {
    const currentDate = new Date();
    const bookingStartDate = new Date(startDate);
    return currentDate < bookingStartDate;
  }

  cancelBooking(booking: any) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      panelClass: 'dialog-container',
      data: {
        title: 'Confirm Cancel Action',
        message: `Are you sure you want to cancel this booking?\n
                  Funds will be sent back to your account`,
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.loaderService.show();
        const response = await this.realEstateService.cancelBooking(booking.id);
        this.loaderService.hide();
        const msg = response?.error ? response?.error : 'Booking was cancelled.';
        this.snackBar.open(msg, 'Close', {
          duration: 3000,
        });

        setTimeout(() => {
          window.location.reload();
        }, 3100);
      }
    });
  }
}
