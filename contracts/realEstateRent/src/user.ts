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
  
    addProperty(propertyId: string): void {
      if (!this.properties.includes(propertyId)) {
        this.properties.push(propertyId);
      }
    }
    removeProperty(propertyId: string): void {
      const index = this.properties.indexOf(propertyId);
      if (index != -1) {
        this.properties.splice(index, 1);
      }
    }
  
    addBooking(bookingId: string): void {
      if (!this.bookings.includes(bookingId)) {
        this.bookings.push(bookingId);
      }
    }
  
    removeBooking(bookingId: string): void {
      const index = this.bookings.indexOf(bookingId);
      if (index != -1) {
        this.bookings.splice(index, 1);
      }
    }
  }