export type Property = {
  id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  options: string[] | string;
  owner: string; // ref to account creator
  price: BigInt;
  images: string[];
  isAvailable: boolean;
  comments: string[]; // reference to comments
  datesBooked: string[]; // maybe zulu date without time
};
