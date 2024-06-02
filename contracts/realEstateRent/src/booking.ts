export class Booking {
    id: string;
    propertyId: string;
    tenant: string;
    startDate: string;
    endDate: string;
    bookedPrice: BigInt;
  
    constructor(id: string, propertyId: string, tenant: string, startDate: string, endDate: string, bookedPrice: BigInt) {
      this.id = id;
      this.propertyId = propertyId;
      this.tenant = tenant;
      this.startDate = startDate;
      this.endDate = endDate;
      this.bookedPrice = bookedPrice;
    }
  
    isActive(): boolean {
      const dateNow = new Date().toISOString().slice(0, 10);
      return this.endDate >= dateNow;
    }
  }
  