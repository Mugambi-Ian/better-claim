import firebase from 'firebase';
import {firebaseConfig} from './config';

firebase.initializeApp(firebaseConfig);
export const _firebase = firebase;
export const _auth = firebase.auth();
export const _storage = firebase.storage();
export const _database = firebase.database();
