export class Comment {
  id: string;
  accountId: string;
  text: string;
  creationDate: Date;

  constructor(id: string, accountId: string, text: string, creationDate: Date) {
    this.id = id;
    this.accountId = accountId;
    this.text = text;
    this.creationDate = creationDate;
  }

  static validateComment(comment: any): { result: boolean; msg: string } {
    let msg = '';

    if (typeof comment !== 'object') {
      msg += 'Comment must be typeof object!';
    }
    if (!comment?.accountId) {
      msg += 'Account is missing!';
    }
    if (!comment?.text) {
      msg += 'Owner is missing!';
    }
    if (!comment.propertyId) {
      msg += 'Property is missing!';
    }
    return { result: !msg, msg };
  }
}
