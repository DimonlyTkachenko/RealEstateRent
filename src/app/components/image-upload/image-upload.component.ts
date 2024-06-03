import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [NgIf],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
})
export class ImageUploadComponent {
  selectedFile: File = null;
  uploadedImageUrl: string = null;

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event) {
    this.selectedFile = (event.target as HTMLInputElement).files[0];
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('image', this.selectedFile, this.selectedFile.name);
    console.log('about to upload image');
    debugger;
    this.http.post<{ url: string }>('http://localhost:3000/upload', formData).subscribe((response) => {
      this.uploadedImageUrl = response.url;
      console.log('image url: ' + response.url);
    });
  }
}
