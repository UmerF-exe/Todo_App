// login.js (module)
import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const msgDiv = document.getElementById('msg');

// Login
loginBtn.addEventListener('click', async () => {
  msgDiv.textContent = '';
  const email = emailInput.value.trim();
  const pass = passInput.value.trim();
  if(!email || !pass){ msgDiv.textContent = 'Enter email and password'; return; }
  try{
    await signInWithEmailAndPassword(auth, email, pass);
    window.location.href = 'index.html';
  }catch(err){
    msgDiv.textContent = err.message;
  }
});

// Signup
signupBtn.addEventListener('click', async () => {
  msgDiv.textContent = '';
  const email = emailInput.value.trim();
  const pass = passInput.value.trim();
  if(!email || !pass){ msgDiv.textContent = 'Enter email and password'; return; }
  try{
    await createUserWithEmailAndPassword(auth, email, pass);
    window.location.href = 'index.html';
  }catch(err){
    msgDiv.textContent = err.message;
  }
});

// Optional: press Enter to login
passInput.addEventListener('keydown', e => { if(e.key==='Enter') loginBtn.click(); });
emailInput.addEventListener('keydown', e => { if(e.key==='Enter') loginBtn.click(); });
