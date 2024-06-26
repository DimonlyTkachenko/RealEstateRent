import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RealEstateService } from '../../services/real-estate.service';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { Property } from '../../entities/property';
import { LoaderService } from '../../services/loader.service';
import { LoaderComponent } from '../common/loader/loader.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-property-create',
  standalone: true,
  imports: [
    ImageUploadComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    LoaderComponent,
  ],
  templateUrl: './property-create.component.html',
  styleUrl: './property-create.component.scss',
})
export class PropertyCreateComponent {
  property: Property = {} as Property;
  isEditMode: boolean = false;
  uploadedImages: any[] = [];
  existingImages: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private realEstateService: RealEstateService,
    private snackBar: MatSnackBar,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    const propertyId = this.route.snapshot.paramMap.get('id');
    if (propertyId) {
      this.isEditMode = true;
      console.log('edit mode enabled for property: ' + propertyId);
      this.realEstateService.getPropertyById(propertyId).subscribe((data) => {
        const property = data as Property;
        this.existingImages = property.images;
        if (property.options && typeof property.options == 'object') {
          property.options = property.options.join(',');
        }
        this.property = data as Property;
      });
    }
  }

  onImagesUploaded(images: any[]) {
    this.uploadedImages = images;
  }

  async onSubmit() {
    if (
      this.property.title &&
      this.property.description &&
      this.property.type &&
      this.property.location &&
      this.property.price
    ) {
      this.loaderService.show();
      this.property.images = this.uploadedImages.map((el) => el.url);
      console.log('@onSubmit: property for update - ', this.property);
      if (this.isEditMode) {
        this.handleOptionsMapping();
        const response = await this.realEstateService.updateProperty(this.property);

        this.loaderService.hide();

        this.snackBar.open(response?.error ? response?.error : 'Property was updated!', 'Close', {
          duration: 3000,
        });

        this.navigateByRoute('/my-properties', 3100);
      } else {
        this.handleOptionsMapping();
        const response = await this.realEstateService.createNewProperty(this.property);
        this.loaderService.hide();
        this.snackBar.open(response?.error ? response?.error : 'Property was created!', 'Close', {
          duration: 3000,
        });
        this.navigateByRoute('/my-properties', 3100);
      }
    } else {
      console.error('Form is invalid');
    }
  }

  handleOptionsMapping() {
    if (typeof this.property.options == 'string') {
      this.property.options = this.property.options.split(',').map((el) => el.trim());
    }
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
