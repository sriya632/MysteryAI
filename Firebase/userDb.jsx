import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const userConfig = {
        apiKey: "AIzaSyAPPv3XYZW26dlicnpwUUYcgWlrfbxNIj8",
        authDomain: "mysteryai-46907.firebaseapp.com",
        projectId: "mysteryai-46907",
        storageBucket: "mysteryai-46907.firebasestorage.app",
        messagingSenderId: "415359645504",
        appId: "1:415359645504:web:2b21c63d87bef26782eca5",
        measurementId: "G-8GV2348PB2"
};

const app = initializeApp(userConfig);
export const auth = getAuth(app);