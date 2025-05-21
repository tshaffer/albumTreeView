import { Document } from 'mongoose';
import { isNil } from 'lodash';
import {
  getUserModel,
} from '../models';
import {
  User,
} from '../types';

export const getUserFromDb = async (googleId: string): Promise<User> => {
  const userModel = getUserModel();
  const filter = { googleId };
  const userDocument: Document = await userModel.findOne(filter);
  if (!isNil(userDocument)) {
    const user: User = userDocument.toObject() as User;
    return user;
  }
  return null;
}

export const updateUserInDb = async (googleId: string, update: Object): Promise<any> => {
  const userModel = getUserModel();
  const filter = { googleId };
  const updatedDoc = await userModel.findOneAndUpdate(filter, update, {
    upsert: true,
    new: true,
  }).exec();
}

