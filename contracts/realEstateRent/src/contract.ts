import { NearBindgen, near, call, view, UnorderedMap, Vector, AccountId, initialize } from 'near-sdk-js';
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
    return allProperties.length ? allProperties : [];
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
  getBookingsByAccount(accountId): Property[] {
    if (!accountId || !this.users.get(accountId)) {
      near.log('@getBookingsByAccount: no account provided or it is not in storage!');
      return [];
    }
    return this.getAllProperties().filter((property) => property.owner == accountId);
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
          return { status: 'ERROR1', error: 'Creation denied. Caller account does not match the owner!' };
        }
        const newProperty = new Property(
          newId,
          object?.title,
          object?.description,
          object?.location,
          object?.owner,
          BigInt(object?.price || 0),
          object?.images,
          object?.isAvailable
        );

        // add to the collection
        this.properties.set(newId, newProperty);

        // update user
        const user = this.createUserIfNotExist(callerAccount);
        // push new property
        user.addProperty(newProperty.id);
      } else {
        return { status: 'ERROR2', error: msg };
      }
    } catch (e) {
      return { status: 'ERROR3', error: e.toString() };
    }
    near.log('gas: ' + near.usedGas());
    return { status: 'CREATED', error: 'no errors it is success!' };
  }

  @call({})
  updateProperty(object: any): object {
    //near.log(`@updateProperty: ${JSON.stringify(object)}`);
    try {
      const { result, msg } = Property.validateProperty(object);

      const existingProperty = this.getPropertyById(object?.id);
      const callerAccount: AccountId = near.predecessorAccountId();
      if (result) {
        // check if caller is the owner
        if (callerAccount !== object?.owner) {
          return { status: 'ERROR', error: 'Update denied. Caller account does not match the owner!' };
        }
        if (existingProperty) {
          existingProperty.title = object?.title;
          existingProperty.description = object?.description;
          existingProperty.price = object?.price;
          existingProperty.isAvailable = object?.isAvailable;
          existingProperty.location = object?.location;
        } else {
          return { status: 'ERROR', error: 'Property does not exist!' };
        }
      } else {
        return { status: 'ERROR', error: msg };
      }
    } catch (e) {
      return { status: 'ERROR', error: e.toString() };
    }
    return { status: 'UPDATED', error: '' };
  }

  @call({})
  deleteProperty(object: any): object {
    near.log(`@deleteProperty: ${JSON.stringify(object)}`);
    try {
      const callerAccount: AccountId = near.predecessorAccountId();
      const existingProperty = this.getPropertyById(object?.id);

      // check if caller is the owner
      if (callerAccount !== object?.owner) {
        return { status: 'ERROR', error: 'Delete denied. Caller account does not match the owner!' };
      }

      const user = this.users.get(callerAccount);

      this.properties.remove(existingProperty.id);
      user.removeProperty(existingProperty.id);
    } catch (e) {
      return { status: 'ERROR', error: e.toString() };
    }

    return { status: 'DELETED', error: '' };
  }

  createUserIfNotExist(accountId: string): User {
    let user = this.users.get(accountId);
    if (!user) {
      const userNewId = this.generateId(this.users);
      user = new User(userNewId, accountId);
      this.users.set(accountId, user);
    }
    return user;
  }

  getAllProperties(): Property[] {
    const allProperties = this.properties;
    return allProperties.isEmpty() ? [] : allProperties.toArray().map(([, property]) => property);
  }

  getPropertyById(id: string): Property {
    return this.properties.get(id);
  }

  /**
   * Generates new id for desired map with data
   * @param map
   * @returns string id
   */
  generateId(map: UnorderedMap<any>): string {
    return map.isEmpty() ? '1' : map.length + 1 + '1';
  }
}
