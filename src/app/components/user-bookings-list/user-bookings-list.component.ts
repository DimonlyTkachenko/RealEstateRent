import { Component, OnInit } from '@angular/core';
import { Property } from '../../entities/property';
import { LoaderComponent } from '../common/loader/loader.component';
import { LoaderService } from '../../services/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { RealEstateService } from '../../services/real-estate.service';

@Component({
  selector: 'app-user-bookings-list',
  standalone: true,
  imports: [],
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
      console.log(data);
    });
  }
}
