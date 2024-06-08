export class Booking {
  id: string;
  propertyId: string;
  tenant: string;
  startDate: string;
  endDate: string;
  bookingTotal: BigInt;
  deleted: boolean;
  fullBookedDays: number;
}
