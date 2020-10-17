import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  // your config
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return <div className='App'>{user ? <ChatRoom /> : <SignIn />}</div>;
}

export default App;

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return <button onClick={signInWithGoogle}>SignIn with Google</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function ChatRoom() {
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const dummy = useRef();

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.uid} message={msg} />)}
        <div ref={dummy}></div>
      </div>
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type='submit'>Sent</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = auth.currentUser.uid === uid ? 'sent' : 'receive';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt='avatar' />
      <p>{text}</p>
    </div>
  );
}
