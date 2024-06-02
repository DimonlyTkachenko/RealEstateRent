import { Component, OnInit } from '@angular/core';
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
  ],
  templateUrl: './property-create.component.html',
  styleUrl: './property-create.component.scss',
})
export class PropertyCreateComponent {
  property: any = {};
  isEditMode: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private realEstateService: RealEstateService) {}

  ngOnInit(): void {
    const propertyId = this.route.snapshot.paramMap.get('id');
    if (propertyId) {
      this.isEditMode = true;
      console.log('edit mode enabled for property: ' + propertyId);
      this.realEstateService.getPropertyById(propertyId).subscribe((data) => {
        const property = data as Property;
        if (property.options && typeof property.options == 'object') {
          property.options = property.options.join(',');
        }
        this.property = data;
      });
    }
  }

  handleImagesUploaded(images: string[]) {
    this.property.images = images;
  }

  onSubmit() {
    if (
      this.property.title &&
      this.property.description &&
      this.property.type &&
      this.property.location &&
      this.property.price
    ) {
      if (this.isEditMode) {
        this.realEstateService.updateProperty(this.property);
        //.subscribe(() => {
        // this.router.navigate(['/properties']);
        // });
      } else {
        this.realEstateService.createNewProperty(this.property);
        // .subscribe(() => {
        //   this.router.navigate(['/properties']);
        // });
      }
    } else {
      console.error('Form is invalid');
    }
  }
}
