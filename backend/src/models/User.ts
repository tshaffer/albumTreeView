import * as mongoose from 'mongoose';
import { connection } from '../config';

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: { type: String, required: true },
    name: { type: String, required: true }, // Add this field
  }
);

export const getUserModel = () => {
  const userModel = connection.model('user', UserSchema);
  return userModel;
}

export default UserSchema;
