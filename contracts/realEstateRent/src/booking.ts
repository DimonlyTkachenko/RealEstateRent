export class Booking {
  id: string;
  propertyId: string; // reference to Property
  tenant: string; // reference to User
  startDate: Date;
  endDate: Date;
  creationDate: Date;
  deleted: boolean;
  bookedPrice: BigInt;
  fullBookedDays: number;

  constructor(
    id: string,
    propertyId: string,
    tenant: string,
    startDate: Date,
    endDate: Date,
    bookedPrice: BigInt,
    fullBookedDays: number,
    creationDate: Date,
    deleted: boolean = false
  ) {
    this.id = id;
    this.propertyId = propertyId;
    this.tenant = tenant;
    this.startDate = startDate;
    this.endDate = endDate;
    this.bookedPrice = bookedPrice;
    this.deleted = deleted;
    this.creationDate = creationDate;
    this.fullBookedDays = fullBookedDays;
  }

  static validateBooking(booking: any): { result: boolean; msg: string } {
    let msg = '';

    if (typeof booking !== 'object') {
      msg += 'Booking must be typeof object!';
    }
    if (!booking?.propertyId) {
      msg += 'Title is missing!';
    }
    if (!booking?.startDate) {
      msg += 'Start date is missing!';
    }
    if (!booking?.endDate) {
      msg += 'End date is missing!';
    }
    if (!booking?.bookedPrice) {
      msg += 'Price is missing!';
    }
    if (!booking?.tenant) {
      msg += 'Tenant is missing!';
    }
    const start = new Date(booking?.startDate);
    const end = new Date(booking?.endDate);
    if (start.getTime() > end.getTime()) {
      msg += 'Start date cannot be greater than end date!';
    }

    return { result: !msg, msg };
  }
}
