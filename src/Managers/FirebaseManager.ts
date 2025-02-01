import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {v4 as uuidV4} from 'uuid';
import {User} from '../Models/User';

class FirebaseManager {
  static signOut() {
    try {
      auth()
        .signOut()
        .then(() => {
          console.log('signed out');
        });
    } catch (error) {
      throw new Error('sign out failed');
    }
  }

  static async createNewUserWithEmailPassword(
    email: string,
    password: string,
  ): Promise<{user?: FirebaseAuthTypes.User; error?: string}> {
    try {
      console.log('user');
      const userCred: FirebaseAuthTypes.UserCredential =
        await auth().createUserWithEmailAndPassword(email, password);
      console.log('user', userCred.user);
      return {user: userCred.user};
    } catch (error: any) {
      console.log('error', error.code);
      if (error.code === 'auth/email-already-in-use') {
        return {error: 'That email address is already in use!'};
      }

      if (error.code === 'auth/invalid-email') {
        return {error: 'That email address is invalid!'};
      }
      return {error: error.code};
    }
  }

  static async loginUserWithEmailPassword(
    email: string,
    password: string,
  ): Promise<{
    user?: FirebaseAuthTypes.User;
    error?: string;
  }> {
    try {
      const userCred = await auth().signInWithEmailAndPassword(email, password);
      return {user: userCred.user};
    } catch (error) {
      return {error: error.message};
    }
  }

  static async addUserToCollection(
    collectionName: string,
    data: User,
  ): Promise<{error?: string}> {
    try {
      console.log('id1111', data);
      const _ = await firestore()
        .collection(collectionName)
        .doc(data.id)
        .set(data);

      return {};
    } catch (error) {
      console.log('erorrr', error);
      return {error: 'unable to add user'};
    }
  }

  static async updateUser(id: string, data: Object): Promise<{error?: string}> {
    try {
      const _ = await firestore()
        .collection('Users')
        .doc(id)
        .update({...data});
      return {};
    } catch (error) {
      console.log('errrrrr-', error);
      return {error: 'unable to update user'};
    }
  }

  static async getUser(): Promise<{user?: any; error?: string}> {
    try {
      const documentSnapshot = await firestore()
        .collection('Users')
        .doc(this.getCurrentuser()?.uid)
        .get();
      if (documentSnapshot.exists) {
        console.log('doc snapshot', documentSnapshot.data());
        return {user: documentSnapshot.data()};
      }
      return {error: 'unable to get user'};
    } catch (error) {
      console.log('errrrrr-', error);
      return {error: 'unable to get user'};
    }
  }

  static getCurrentuser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  static async updateFirebaseUserProfile(newProfile: any) {
    try {
      const currentUser = this.getCurrentuser();
      if (currentUser) {
        await currentUser.updateProfile(newProfile);
      }
    } catch (error) {
      console.log('unable to update username', error);
    }
  }
}

export default FirebaseManager;
