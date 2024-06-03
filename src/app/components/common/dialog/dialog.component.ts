import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="dialog-container">
      <h1 mat-dialog-title>{{ data.title }}</h1>
      <div mat-dialog-content>
        <p>{{ data.message }}</p>
      </div>
      <div mat-dialog-actions>
        <button mat-button (click)="onNoClick()">Cancel</button>
        <button mat-button color="warn" cdkFocusInitial (click)="onYesClick()">Confirm</button>
      </div>
    </div>
  `,
  styles: [
    `
      h1 {
        font-size: 24px;
        margin-bottom: 10px;
        font-weight: bold;
      }

      mat-dialog-content {
        font-size: 16px;
        margin-bottom: 20px;
        color: rgba(0, 0, 0, 0.87);
      }

      mat-dialog-actions {
        position: absolute;
        right: 0;
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
      }

      button {
        margin-left: 10px;
        font-weight: bold;
      }

      button[color='warn'] {
        background-color: #d32f2f;
        color: white;
      }

      button[color='warn']:hover {
        background-color: #c62828;
      }

      .dialog-container {
        padding: 20px;
        max-width: 400px;
        width: 100%;
        border-radius: 50px;
      }
    `,
  ],
})
export class DialogComponent {
  constructor(public dialogRef: MatDialogRef<DialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
