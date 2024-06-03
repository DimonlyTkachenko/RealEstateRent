import { Component } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { LoaderService } from '../../../services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  imports: [NgIf, CommonModule]
})
export class LoaderComponent {
  constructor(public loaderService: LoaderService) {}
}
