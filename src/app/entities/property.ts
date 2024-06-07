import  {Comment} from './comment';

export type Property = {
  id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  options: string[] | string;
  owner: string;
  price: BigInt;
  images: string[];
  isAvailable: boolean;
  creationDate: Date;
  comments: Comment[]; // reference to Comment
  datesBooked: string[];
};
