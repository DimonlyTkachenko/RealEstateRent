import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { RealEstateService } from '../../services/real-estate.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxChange, MatCheckbox } from '@angular/material/checkbox';
import { DialogComponent } from '../common/dialog/dialog.component';
import { LoaderService } from '../../services/loader.service';
import { LoaderComponent } from '../common/loader/loader.component';

@Component({
  selector: 'app-user-properties-list',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, RouterOutlet, MatButtonModule, MatCheckbox, LoaderComponent],
  templateUrl: './user-properties-list.component.html',
  styleUrl: './user-properties-list.component.scss',
})
export class UserPropertiesListComponent {
  private realEstateService = inject(RealEstateService);
  private snackBar = inject(MatSnackBar);
  private loaderService = inject(LoaderService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  userProperties: any[];
  isInitialized = false;
  isSignedIn: boolean;

  ngOnInit(): void {
    this.realEstateService.isInitialized$.subscribe((initialized) => {
      this.isInitialized = initialized;
    });
    this.realEstateService.isSignedIn$.subscribe((isSignedIn) => {
      this.isSignedIn = isSignedIn;
    });
    this.realEstateService.getUserProperties().subscribe((data) => {
      console.log(data);
      this.userProperties = data;
    });
  }

  confirmDelete(property: any): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      panelClass: 'dialog-container',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete '${property.title}' property?`,
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.deleteProperty(property);
      }
    });
  }
  async deleteProperty(property: any) {
    this.loaderService.show();
    const response = await this.realEstateService.deleteProperty(property);
    this.loaderService.hide();

    this.snackBar.open(response?.error ? response?.error : 'Property deleted', 'Close', {
      duration: 2000,
    });

    setTimeout(() => {
      window.location.reload();
    }, 2500);

  }
}
