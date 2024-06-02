export class User {
  id: string;
  accountId: string; // Near account
  properties: string[];
  bookings: string[];

  constructor(id: string, accountId: string) {
    this.id = id;
    this.accountId = accountId;
    this.bookings = [];
    this.properties = [];
  }
  // static methods are used because Near storage contains serialized plain JS objects without functions
  public static addProperty(user: User, propertyId: string): void {
    if (!user.properties.includes(propertyId)) {
      user.properties.push(propertyId);
    }
  }
  public static removeProperty(user: User, propertyId: string): void {
    const index = user.properties.indexOf(propertyId);
    if (index != -1) {
      user.properties.splice(index, 1);
    }
  }

  public static addBooking(user: User, bookingId: string): void {
    if (!user.bookings.includes(bookingId)) {
      user.bookings.push(bookingId);
    }
  }

  public static removeBooking(user: User, bookingId: string): void {
    const index = user.bookings.indexOf(bookingId);
    if (index != -1) {
      user.bookings.splice(index, 1);
    }
  }
}
