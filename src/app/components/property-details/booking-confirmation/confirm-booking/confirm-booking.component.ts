import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-booking',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  styles: [
    `
      .confirmation-dialog {
        max-width: 1000px;
        width: 90vw;
        max-height: 90vh;
        padding: 20px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        background: white;
        font-size: 1.1rem;
      }

      .property-details,
      .booking-details {
        margin-bottom: 20px;
      }

      .actions {
        display: flex;
        justify-content: center;
      }
      button{
        margin: 10px;
      }
      .separator-line{
        width: 100%;
        border: 1px solid black;
        margin-bottom: 10px;
      }
    `,
  ],
  templateUrl: './confirm-booking.component.html',
})
export class ConfirmBookingComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmBookingComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
