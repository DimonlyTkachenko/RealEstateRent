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
      console.log('edit mode');
      // this.realEstateService.getPropertyById(propertyId).subscribe(data => {
      //   this.property = data;
      // });
    }
  }

  handleImagesUploaded(images: string[]) {
    this.property.images = images;
  }

  onSubmit() {
    console.log('form submit!');
  }
}
