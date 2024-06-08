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
  public static addProperty(user: User, propertyId: string): User {
    if (!user.properties.includes(propertyId)) {
      user.properties.push(propertyId);
    }
    return user;
  }
  public static removeProperty(user: User, propertyId: string): User {
    const index = user.properties.indexOf(propertyId);
    if (index != -1) {
      user.properties.splice(index, 1);
    }
    return user;
  }

  public static addBooking(user: User, bookingId: string): User {
    if (!user.bookings.includes(bookingId)) {
      user.bookings.push(bookingId);
    }
    return user;
  }

  public static removeBooking(user: User, bookingId: string): User {
    const index = user.bookings.indexOf(bookingId);
    if (index != -1) {
      user.bookings.splice(index, 1);
    }
    return user;
  }
}
