import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RealEstateService } from '../../services/real-estate.service';
import { ImageUploadComponent } from '../image-upload/image-upload.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-property-create',
  standalone: true,
  imports: [ImageUploadComponent, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
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
      // this.realEstateService.getPropertyById(propertyId).subscribe(data => {
      //   this.property = data;
      // });
    }
  }

  handleImagesUploaded(images: string[]) {
    this.property.images = images;
  }

  onSubmit() {
    if (this.property.title && this.property.description) {
      console.log(
        'creating new property, title: ' + this.property.title + '. description: ' + this.property.description
      );
      this.realEstateService.createNewProperty({
        title: this.property.title,
        description: this.property.description,
        images: [
          'https://media.istockphoto.com/id/1026205392/photo/beautiful-luxury-home-exterior-at-twilight.jpg?s=612x612&w=0&k=20&c=HOCqYY0noIVxnp5uQf1MJJEVpsH_d4WtVQ6-OwVoeDo=',
        ],
      });
    } else {
      console.error('Form is invalid');
    }
  }
}
