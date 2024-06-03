import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealEstateService } from '../../services/real-estate.service';

class ImageSnippet {
  isPending: boolean = false;
  status: string = 'init';

  constructor(public src: string, public file: File) {}
}

@Component({
  standalone: true,
  selector: 'app-image-upload',
  templateUrl: 'image-upload.component.html',
  styleUrls: ['image-upload.component.scss'],
  imports: [CommonModule],
})
export class ImageUploadComponent {
  selectedFile: ImageSnippet;

  constructor(private imageService: RealEstateService) {}

  private onSuccess() {
    this.selectedFile.isPending = false;
    this.selectedFile.status = 'ok';
  }

  private onError() {
    this.selectedFile.isPending = false;
    this.selectedFile.status = 'fail';
    this.selectedFile.src = '';
  }

  processFile(imageInput: any) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: any) => {
      this.selectedFile = new ImageSnippet(event.target.result, file);

      this.selectedFile.isPending = true;
      this.imageService.uploadImage(this.selectedFile.file).subscribe(
        (res) => {
          console.log(res);
          this.onSuccess();
        },
        (err) => {
          this.onError();
        }
      );
    });

    reader.readAsDataURL(file);
  }
}
