import { Component, Input } from '@angular/core';
import { PropertyCardComponent } from '../property-card/property-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [PropertyCardComponent, CommonModule],
  templateUrl: './property-list.component.html',
  styleUrl: './property-list.component.scss',
})
export class PropertyListComponent {
  @Input() properties: any[];
}
