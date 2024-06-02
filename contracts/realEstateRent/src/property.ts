export const IMAGES_LIMIT = 6;

export class Property {
  id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  options: string[];
  owner: string; // ref to account creator
  price: BigInt;
  images: string[];
  isAvailable: boolean;
  comments: string[]; // reference to comments
  datesBooked: string[]; // maybe zulu date without time

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
    isAvailable: boolean = true
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
    this.comments = [];
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
}

enum PropertyType {
  house = 'House',
  apartment = 'Apartment',
  flat = 'Flat',
  land = 'Land',
  office = 'Office',
}
