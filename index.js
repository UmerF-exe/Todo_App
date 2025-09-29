import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, provider, signInWithPopup, signOut } from "./firebase.js";

const signinForm = document.getElementById("signinForm");
const signupForm = document.getElementById("signupForm");
const forgotForm = document.getElementById("forgotForm");

function showSignin() {
  signinForm.style.display = "block";
  signupForm.style.display = "none";
  forgotForm.style.display = "none";
}

// -------------------- SIGNUP --------------------
let signUp = (e) => {
  e.preventDefault();

  let email = document.getElementById("r-email").value.trim();
  let password = document.getElementById("newPassword").value.trim();
  let confirmPassword = document.getElementById("confirmPassword").value.trim();

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!email && !password && !confirmPassword) {
    alert("⚠️ All fields are required.!");
  }
  else if (!email) {
    alert("⚠️ Email is required.!");
  }
  else if (!passwordPattern.test(password)) {
    alert("⚠️ Password must be at least 8 characters long and includes uppercase, lowercase, number, and special characters (@$!%*?&).");
  }
  else if (password !== confirmPassword) {
    alert("⚠️ Passwords do not match");
  }
  else {
    createUserWithEmailAndPassword(auth, email, password).then(() => {
        alert("✅ User registered successfully!");
        showSignin();
      })
      .catch((error) => {
        let msg;
        switch (error.code) {
          case "auth/email-already-in-use":
            msg = "This email is already registered.!";
            break;
          case "auth/invalid-email":
            msg = "Invalid email format.!";
            break;
          default:
            msg = error.code + ".!";
        }
        alert("⚠️ " + msg)
      });
  }
};

let signupBtn = document.getElementById("signup");
if (signupBtn) {
  signupBtn.addEventListener("click", signUp);
}

// -------------------- SIGNIN --------------------
function signIn(e) {
  e.preventDefault();

  let email = document.getElementById("l-email").value.trim();
  let password = document.getElementById("l-password").value.trim();

  if (!email && !password) {
    alert("⚠️ Both Email and Password are required.!");
  }
  else if(!email){
    alert("⚠️ Email is required.!");
  }
  else if(!password){
    alert("⚠️ Password is required.!");
  }
  else {
    signInWithEmailAndPassword(auth, email, password).then(() => {
        alert("✅ Signed in successfully");
        location = "home.html";
      })
    .catch((error) => {
      let msg;
      switch (error.code) {
        case "auth/user-not-found":
          msg = "No user found with this email.!";
          break;
        case "auth/wrong-password":
          msg = "Incorrect password.!";
          break;
        case "auth/invalid-email":
          msg = "Invalid email format.!";
          break;
        case "auth/invalid-credential":
          msg = "Invalid credentials.!"
          break;
        default:
          msg = error.code + ".!";
      }
      alert("⚠️ " + msg)
    });
  }
}
let signinBtn = document.getElementById("signin");
if (signinBtn) {
  signinBtn.addEventListener("click", signIn);
}


// --------------- Reset Password ---------------
let resetPassword = () =>{
  let email = document.getElementById("resetEmail");
  if(!email.value){
    alert("⚠️ Email is required.!");
  }
  else{
    sendPasswordResetEmail(auth, email.value).then(() => {
      alert("If this email " + email.value + " is registered, you’ll receive a reset link, otherwise not.!");
      showSignin();
      email.value = "";
    })
    .catch((error) => {
      alert("⚠️ " + error.code);
    });
  }
}
let resetBtn = document.getElementById("resetBtn");
if(resetBtn){
  resetBtn.addEventListener("click", resetPassword)
}

// --------------- Sign In with Google ---------------
let signInWithGoogle = () =>{
signInWithPopup(auth, provider)
  .then(() => {
    location = "home.html";
  }).catch((error) => {
    alert("⚠️ " + error.code)
  });
}
let googleBtn = document.getElementById("googleBtn");
if(googleBtn){
  googleBtn.addEventListener("click", signInWithGoogle)
}

// -------------------- LOGOUT --------------------
let signout = () => {
  signOut(auth)
    .then(() => {
      location = "index.html";
    })
    .catch((error) => {
      console.log(error.code);
    });
};
let signoutBtn = document.getElementById("signOut");
if (signoutBtn) {
  signoutBtn.addEventListener("click", signout);
}