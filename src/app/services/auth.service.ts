import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { User } from '../home/user.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

   user: Observable<User>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
  ) {
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null)
        }
      })
    )
  }
  
  googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    console.log(provider);
    
    return this.oAuthLogin(provider);
  }
  
  FBLogin() {
    const provider = new firebase.auth.FacebookAuthProvider();
    return this.oAuthLogin(provider);
  }

  private oAuthLogin(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
    .then((credential) => {
      console.log(credential.user);

      this.updateUserData(credential.user)
    })
  }

  private updateUserData(user) {
    //sets user data to firebase om login
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);

    const data: User = {
      uid: user.uid, 
      email: user.email,
      displayName: user.displayName, 
      photoURL: user.photoURL, 
    };

    return userRef.set(data);
  }

  async signOut() {
    await this.afAuth.auth.signOut();  
  }

}
