import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyAzvAgfF19anahR2r3A9e_JvIrisBEP5FI",
    authDomain: "ecommerce-project-37733.firebaseapp.com",
    projectId: "ecommerce-project-37733",
    storageBucket: "ecommerce-project-37733.appspot.com",
    messagingSenderId: "777575350295",
    appId: "1:777575350295:web:65e868aaab1b16f47b1c52"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
