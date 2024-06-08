import { NearBindgen, near, call, view, UnorderedMap, AccountId, assert } from 'near-sdk-js';
import { Property } from './property';
import { User } from './user';
import { Booking } from './booking';
import { Comment } from './comment';

// constants
const ONE_NEAR = BigInt('1000000000000000000000000');

@NearBindgen({})
class RealEstateNear {
  properties = new UnorderedMap<Property>('unique-properties');
  users = new UnorderedMap<User>('unique-users');
  comments = new UnorderedMap<Comment>('unique-comments');
  bookings = new UnorderedMap<Booking>('unique-bookings');

  /**
   * Main veiw function for retrieving properties
   * @returns list of avaialable properties
   */
  @view({})
  getAllAvailableProperties(): Property[] {
    const allProperties = this.getAllProperties();
    return allProperties.length ? allProperties.filter((el) => el.isAvailable) : [];
  }

  @view({})
  getPropertyById({ id }): Property {
    return id ? this.internalGetPropertyById(id) : ({} as Property);
  }

  @view({})
  getPropertiesByAccount({ accountId }): Property[] {
    near.log('accountID: ' + accountId);
    if (!accountId || !this.users.get(accountId)) {
      near.log('@getPropertiesByAccount: no account provided or it is not in storage!');
      return [];
    }
    return this.getAllProperties().filter((property) => property.owner == accountId);
  }

  @view({})
  getBookingsByAccount({ accountId }): Property[] {
    if (!accountId || !this.users.get(accountId)) {
      near.log('@getBookingsByAccount: no account provided or it is not in storage!');
      return [];
    }
    return this.getAllProperties().filter((property) => property.owner == accountId);
  }

  @view({})
  getCommentsByProperty({ id }): any[] {
    if (!id || !this.properties.get(id)) {
      near.log('@getCommentsByProperty: no property provided or it is not in storage!');
      return [];
    }
    const property = this.properties.get(id);
    return this.getObjectsByRef(property.comments, this.comments);
  }

  @view({})
  getBookingsByUser({ id }): any[] {
    if (!id || !this.users.get(id)) {
      near.log('@getBookingsByUser: no user provided or it is not in storage!');
      return [];
    }
    const user = this.users.get(id);
    return this.getObjectsByRef(user.bookings, this.bookings);
  }

  @view({})
  getBookingsByProperty({ id }): any[] {
    if (!id || !this.properties.get(id)) {
      near.log('@getBookingsByProperty: no property provided or it is not in storage!');
      return [];
    }
    const property = this.properties.get(id);
    return this.getObjectsByRef(property.bookings, this.bookings);
  }

  /**
   * Function to create new property
   * @param object typeof Property
   * @returns object with result
   */
  @call({})
  addProperty(object: any): object {
    // near.log(`@addProperty: ${JSON.stringify(object)}`);
    //let donationAmount: bigint = near.attachedDeposit() as bigint;

    try {
      const newId = this.generateId(this.properties);

      const { result, msg } = Property.validateProperty(object);
      const callerAccount: AccountId = near.predecessorAccountId();

      if (result) {
        // check if caller is the owner
        if (callerAccount !== object?.owner) {
          return { status: 'ERROR', error: 'Creation denied. Caller account does not match the owner!' };
        }
        const newProperty = new Property(
          newId,
          object?.title,
          object?.description,
          object?.type,
          object?.location,
          object?.options,
          object?.owner,
          BigInt(object?.price || 0),
          object?.images,
          object?.isAvailable,
          this.prepareDate(object?.creationDate)
        );

        // add to the collection
        this.properties.set(newId, newProperty);

        // update user
        const user: User = this.createUserIfNotExist(callerAccount);

        // push new property and update user
        this.users.set(user.accountId, User.addProperty(user, newProperty.id));
      } else {
        return { status: 'ERROR', error: msg };
      }
    } catch (e) {
      return { status: 'ERROR', error: e.msg + ' @ ' + e.stack };
    }
    near.log('gas: ' + near.usedGas());
    return { status: 'CREATED', error: '' };
  }
  @call({})
  updateProperty(object: any): object {
    const existingProperty = this.internalGetPropertyById(object?.id);
    const callerAccount: AccountId = near.predecessorAccountId();

    try {
      const { result, msg } = Property.validateProperty(object);

      if (!result) {
        return { status: 'ERROR', error: 'Validation error: ' + msg };
      }

      if (callerAccount !== object?.owner) {
        return { status: 'ERROR', error: 'Update denied. Caller account does not match the owner!' };
      }

      if (!existingProperty) {
        return { status: 'ERROR', error: 'Property does not exist!' };
      }

      existingProperty.title = object?.title ?? existingProperty.title;
      existingProperty.description = object?.description ?? existingProperty.description;
      existingProperty.type = object?.type ?? existingProperty.type;
      existingProperty.price = object?.price ?? existingProperty.price;
      existingProperty.options = object?.options ?? existingProperty.options;
      existingProperty.isAvailable = object?.isAvailable ?? existingProperty.isAvailable;
      existingProperty.location = object?.location ?? existingProperty.location;
      existingProperty.images = object?.images || [];

      // Reset property
      this.properties.set(object?.id, existingProperty);

      return { status: 'UPDATED', error: '' };
    } catch (e) {
      return { status: 'ERROR', error: e.toString() };
    }
  }

  @call({})
  deleteProperty(object: any): object {
    //near.log(`@deleteProperty: ${JSON.stringify(object)}`);
    try {
      const callerAccount: AccountId = near.predecessorAccountId();
      const existingProperty = this.internalGetPropertyById(object?.id);

      // check if caller is the owner
      if (callerAccount !== object?.owner) {
        return { status: 'ERROR', error: 'Delete denied. Caller account does not match the owner!' };
      }
      const user = this.users.get(callerAccount);

      this.properties.remove(existingProperty.id);

      this.users.set(user.accountId, User.removeProperty(user, existingProperty.id));
    } catch (e) {
      return { status: 'ERROR', error: e.toString() };
    }

    return { status: 'DELETED', error: '' };
  }

  @call({ payableFunction: true })
  createNewBooking(object: any): object {
    const bookingCost: bigint = near.attachedDeposit() as bigint;

    try {
      const { result, msg } = Booking.validateBooking(object);
      const callerAccount: AccountId = near.predecessorAccountId();

      if (result) {
        // check if caller is the owner
        if (callerAccount !== object?.tenant) {
          return { status: 'ERROR', error: 'Booking denied. Caller account does not match the tenant!' };
        }

        const existingProperty = this.internalGetPropertyById(object?.propertyId);
        if (!existingProperty) {
          return { status: 'ERROR', error: 'Property does not exist!' };
        }
        const newId = this.generateId(this.bookings);

        const newBooking = new Booking(
          newId,
          object?.propertyId,
          object?.tenant,
          this.prepareDate(object?.startDate),
          this.prepareDate(object?.endDate),
          BigInt(object?.bookingTotal || 0),
          object?.totalUsd,
          object?.fullBookedDays,
          this.prepareDate(object?.creationDate)
        );

        Property.addBooking(existingProperty, newId);

        // add to the collection
        this.bookings.set(newId, newBooking);
        this.properties.set(existingProperty.id, existingProperty);

        // update user
        const user: User = this.createUserIfNotExist(callerAccount);
        this.users.set(user.accountId, User.addBooking(user, newId));

        // handle payment
        const promise = near.promiseBatchCreate(existingProperty.owner);
        near.promiseBatchActionTransfer(promise, bookingCost);

        near.log(`transfered ${bookingCost} near from ${callerAccount} to ${existingProperty.owner}`);
      } else {
        return { status: 'ERROR', error: msg };
      }
    } catch (e) {
      return { status: 'ERROR', error: e.msg + ' @ ' + e.stack };
    }
    return { status: 'CREATED', error: '' };
  }

  @call({})
  cancelBooking(object: any): object {
    const bookingId = object?.id;
    try {
      const callerAccount: AccountId = near.predecessorAccountId();

      if (bookingId) {
        const booking = this.bookings.get(bookingId);

        if (!booking) {
          return { status: 'ERROR', error: 'Booking does not exist!' };
        }
        // check if caller is the tenant
        if (callerAccount !== booking.tenant) {
          return { status: 'ERROR', error: 'Cancel denied. Caller account does not match the tenant!' };
        }

        const existingProperty = this.internalGetPropertyById(booking.propertyId);

        if (!existingProperty) {
          return { status: 'ERROR', error: 'Property in booking does not exist!' };
        }

        this.properties.set(existingProperty.id, Property.removeBooking(existingProperty, booking.id));

        booking.deleted = true;
        this.bookings.set(booking.id, booking);

        // update user
        const user: User = this.createUserIfNotExist(callerAccount);
        this.users.set(user.accountId, User.removeBooking(user, bookingId));
        // handle payment
        const promise = near.promiseBatchCreate(booking.tenant);
        near.promiseBatchActionTransfer(promise, booking.bookingTotal as any);
      } else {
        return { status: 'ERROR', error: 'Booking id is not provided!' };
      }
    } catch (e) {
      return { status: 'ERROR', error: e.msg + ' @ ' + e.stack };
    }
    return { status: 'CANCELLED', error: '' };
  }

  @call({})
  createComment(object: any): object {
    near.log(`@createComment: ${JSON.stringify(object)}`);
    try {
      const callerAccount: AccountId = near.predecessorAccountId();

      // check if caller is the owner
      if (callerAccount !== object?.accountId) {
        return { status: 'ERROR', error: 'Create denied. Caller account does not match the owner!' };
      }

      const { result, msg } = Comment.validateComment(object);

      if (!result) {
        return { status: 'ERROR', error: 'Validation error: ' + msg };
      }

      // TODO: add validation for comment posting permission
      const user: User = this.createUserIfNotExist(callerAccount);
      const existingProperty = this.internalGetPropertyById(object?.propertyId);
      const newId = this.generateId(this.comments);
      const comment = new Comment(newId, object.accountId, object.text, this.prepareDate(object?.creationDate));
      existingProperty.comments.push(newId);
      // update maps
      this.comments.set(newId, comment);
      this.properties.set(existingProperty.id, existingProperty);
    } catch (e) {
      return { status: 'ERROR', error: e.toString() + ' @ ' + e.stack };
    }

    return { status: 'CREATED', error: '' };
  }

  createUserIfNotExist(accountId: string): User {
    let user: User = this.users.get(accountId);

    if (!user) {
      const userNewId = this.generateId(this.users);
      user = new User(userNewId, accountId);
      this.users.set(accountId, user);
    }
    return user;
  }

  getObjectsByRef(objects: string[], dataMap: UnorderedMap<any>): any[] {
    const res = [];
    if (!objects?.length) {
      return [];
    }
    for (let object of objects) {
      const value = dataMap.get(object);
      if (value) {
        res.push(value);
      }
    }
    return res;
  }

  getAllProperties(): Property[] {
    const allProperties = this.properties;
    return allProperties.isEmpty() ? [] : allProperties.toArray().map(([, property]) => property);
  }

  prepareDate(date: string): Date {
    if (!date) return new Date();
    return new Date(date);
  }

  getAllBookings(): Booking[] {
    const allBookings = this.bookings;
    return allBookings.isEmpty() ? [] : allBookings.toArray().map(([, booking]) => booking);
  }

  internalGetPropertyById(id: string): Property {
    return this.properties.get(id);
  }

  /**
   * Generates new id for desired map with data
   * @param map
   * @returns string id
   */
  generateId(map: UnorderedMap<any>): string {
    let newId = this.generateUniqueId();
    // check for id to be unique
    while (!!map.get(newId)) {
      newId = this.generateUniqueId();
    }
    return newId;
  }

  generateUniqueId(): string {
    return 'xxxx-xxxx-xxx-xxxx'.replace(/[x]/g, (c) => {
      const r = Math.floor(Math.random() * 16);
      return r.toString(16);
    });
  }
}
