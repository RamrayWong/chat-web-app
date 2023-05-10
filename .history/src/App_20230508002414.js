import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import './saul.jpg';
import Video from './Video.js';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore'; // database
import 'firebase/compat/auth';
import 'firebase/compat/analytics';
import { firebaseConfig } from './firebase.config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Timestamp } from 'firebase/firestore';

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {

  const [user] = useAuthState(auth); // user is null when signed out, an object when signed in

  return (
    <div className="App">
      <header className="App-header">
      <h1 className='title'>CHAT ROOM</h1>
        <SignOut />
        <section> {/* if user, show chat. Else, sign in*/}
          {user ? <ChatRoom name={user.displayName} /> : <SignIn />}
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
    <button className='login-with-google-btn' onClick = {signInWithGoogle}>Sign in with Google</button>
    </div>
  )
}

function SignOut() {
  return auth.currentUser && ( // Check if there is current user
    <button className='sign-out' onClick = {() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom(props) {
  const { name } = props
  const dummy = useRef();
  const containerRef = useRef(null);
  const messagesRef = firestore.collection('messages'); // Reference msgs in database
  const query = messagesRef.orderBy('createdAt');

  const [messages] = useCollectionData(query, {idField: 'id'}); // Returns array of chat messages
  const [formValue, setFormValue] = useState('')

  useEffect(() => {
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [containerRef.current]);

  const sendMessage = async (e) => {
    e.preventDefault(); // prevent refreshing upon new message

    const { uid, photoURL } = auth.currentUser;

    // Write a new document to firestore
    await messagesRef.add({
      text: formValue,
      createdAt:firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      name
    })
    
    setFormValue(''); // reset form value back to empty
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className='chat-window'>
      <main className='msg-window' ref={containerRef}>
        {/* pass document data as message prop for each message */}
        
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} name={name}/>)}
      
        <span ref={dummy}></span>
      </main>

    
      <form className='form-window' onSubmit = {sendMessage}>
        {/* bind value to formValue state.
            When user types message, listens to onChange event and takes new value. */}
        
        <input className='msg-input' value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder = 'say something nice'/>
        <button className='msg-send' type='submit' disabled={!formValue}>SEND</button>
      </form>
    </div>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL, name, createdAt } = props.message; // access message data and uid 

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'; // check if a msg is sent or receieved

  const timeStamp = createdAt ? new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(createdAt.toDate()) : '';

  return (<>
    <div className={`message`}>
      <img referrerPolicy='no-referrer' className='pic' src={photoURL}/> 
      <div className='message-header'>
        <strong className='username'>{name}</strong>
        <span className='timestamp'>{timeStamp}</span>
      </div>
      <div className='message-content'>
        <p>{text}</p>
      </div>
    </div>
  </>)
}

export default App;
