import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealEstateService } from '../../services/real-estate.service';

const IMAGES_LIMIT = 6;

class ImageSnippet {
  isPending: boolean = false;
  status: string = 'init';

  constructor(public src: string, public file: File) {}
}

export type Image = {
  id: number;
  url: string;
  status: string;
  src: string;
};

@Component({
  standalone: true,
  selector: 'app-image-upload',
  templateUrl: 'image-upload.component.html',
  styleUrls: ['image-upload.component.scss'],
  imports: [CommonModule],
})
export class ImageUploadComponent implements OnChanges {
  @Output() imagesUploaded = new EventEmitter<Image[]>();
  @Input() existingImages: string[] = [];

  selectedFile: ImageSnippet | null = null; // represents current uploaded file
  allImages: Image[] = [];
  isEditMode: boolean = false;

  constructor(private imageService: RealEstateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingImages'] && changes['existingImages'].currentValue) {
      if (!this.isEditMode && changes['existingImages'].currentValue && changes['existingImages'].currentValue.length) {
        this.allImages = changes['existingImages'].currentValue.map((url: string, index: number) => ({
          id: index,
          url,
          src: url,
          status: 'ok',
        }));
        this.isEditMode = true;
        console.log('@ngOnChanges: allImages', this.allImages);
      }
    }
  }

  private onSuccess(res: any, src: string) {
    if (this.selectedFile) {
      this.selectedFile.isPending = false;
      this.selectedFile.status = 'ok';

      // add image to the list
      const newId = this.allImages.length + 1;
      this.allImages.push({ id: newId, url: res.url, status: 'ok', src });
      this.imagesUploaded.emit(this.allImages);
    }
  }

  private onError() {
    if (this.selectedFile) {
      this.selectedFile.isPending = false;
      this.selectedFile.status = 'fail';
    }
  }

  processFile(imageInput: any) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: any) => {
      this.selectedFile = new ImageSnippet(event.target.result, file);

      this.selectedFile.isPending = true;
      this.imageService.uploadImage(this.selectedFile.file).subscribe(
        (res) => {
          this.onSuccess(res, event.target.result);
        },
        (err) => {
          this.onError();
        }
      );
    });

    reader.readAsDataURL(file);
  }

  deleteImage(image: Image) {
    const index = this.allImages.indexOf(image);
    if (index >= 0) {
      this.allImages.splice(index, 1);
      this.imagesUploaded.emit(this.allImages);
    }
  }
}
