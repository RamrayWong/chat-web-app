import React, { useRef, useState } from 'react';
import './App.css';
import './saul.jpg';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore'; // database
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyA07RLLPQa7E6hYQ7IU4_ixxgVdukoR5Zc",
  authDomain: "watch-party-53f65.firebaseapp.com",
  projectId: "watch-party-53f65",
  storageBucket: "watch-party-53f65.appspot.com",
  messagingSenderId: "1030292727104",
  appId: "1:1030292727104:web:e11f8c275fa9ce90f3c6a5",
  measurementId: "G-M1KX8FMRPN"
})

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {

  const [user] = useAuthState(auth); // user is null when signed out, an object when signed in

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <SignOut />
        <section> {/* if user, show chat. Else, sign in*/}
          {user ? <ChatRoom /> : <SignIn />}
        </section>
      </header>
    </div>
  );
}

function SignIn() {

  
  const signInWithGoogle = () => { // Sign in with Google pop-up
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
    <div>
    <button className='sign-in' onClick = {signInWithGoogle}>Sign in with Google</button> 
    <p>Do not violate the community guidelines or you will be banned for life!</p>
    </div>
  )
}

function SignOut() {
  return auth.currentUser && ( // Check if there is current user
    <button className='sign-out' onClick = {() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages'); // Reference msgs in database
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, {idField: 'id'}); // Returns array of chat messages
  const [formValue, setFormValue] = useState('')

  const sendMessage = async (e) => {
    e.preventDefault(); // prevent refreshing upon new message

    const { uid, photoURL } = auth.currentUser;

    // Write a new document to firestore
    await messagesRef.add({
      text: formValue,
      createdAt:firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    
    setFormValue(''); // reset form value back to empty
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className='chat-window'>
      <main className='msg-window'>
        {/* pass document data as message prop for each message */}
        MSG-WINDOW
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      
        <span ref={dummy}></span>
      </main>

      <div className='form-window'>
        <form onSubmit = {sendMessage}>
          {/* bind value to formValue state.
              When user types message, listens to onChange event and takes new value. */}

          <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder = 'say something nice'/>
          <button type='submit' disabled={!formValue}>Button</button>
        </form>
      </div>
    </div>
  )
}

function ChatMessage(props) {

  const { text, uid, photoURL } = props.message; // access message data and uid 

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'; // check if a msg is sent or receieved

  return (
    <div className={`message ${messageClass}`}>
      {/* profile picture */}
      <img referrerPolicy='no-referrer' className='pic' src={photoURL} /> 
      <p>{`${messageClass}: ${text}`}</p>
    </div>
  )
}

export default App;
