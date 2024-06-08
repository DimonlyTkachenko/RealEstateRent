import { Comment } from './comment';

export const IMAGES_LIMIT = 6;

export class Property {
  id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  options: string[];
  owner: string;
  price: BigInt;
  images: string[];
  isAvailable: boolean;
  creationDate: Date;
  comments: string[]; // reference to Comment
  bookings: string[]; // reference to Booking

  constructor(
    id: string,
    title: string,
    description: string = '',
    type: string = '',
    location: string = 'not specified',
    options: string[],
    owner: string, // Near account
    price: BigInt = BigInt(0),
    images: string[] = [], // only urls
    isAvailable: boolean = true,
    creationDate: Date = new Date()
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.type = type;
    this.location = location;
    this.options = options;
    this.owner = owner;
    this.price = price;
    this.isAvailable = isAvailable;
    this.creationDate = creationDate;
    this.comments = [];
    this.bookings = [];
    this.images = images.length > IMAGES_LIMIT ? images.slice(0, IMAGES_LIMIT) : images;
  }

  static validateProperty(prop: any): { result: boolean; msg: string } {
    let msg = '';

    if (typeof prop !== 'object') {
      msg += 'Property must be an object!';
    }
    if (!prop?.title) {
      msg += 'Title is missing!';
    }
    if (!prop?.owner) {
      msg += 'Owner is missing!';
    }
    return { result: !msg, msg };
  }
  public static addBooking(property: Property, bookingId: string): void {
    if (!property.bookings) {
      property.bookings = [];
    }
    if (!property.bookings.includes(bookingId)) {
      property.bookings.push(bookingId);
    }
  }

  // static addComment(property: Property, commentId: string) {
  //   if (!property.comments) {
  //     property.comments = [];
  //   }
  //   property.comments.push(commentId);
  // }
}
