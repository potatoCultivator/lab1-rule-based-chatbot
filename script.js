// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkpW-lrHA7MLcbizix6923mYgv9hry7H4",
  authDomain: "facts-and-rules.firebaseapp.com",
  projectId: "facts-and-rules",
  storageBucket: "facts-and-rules.appspot.com",
  messagingSenderId: "868904576091",
  appId: "1:868904576091:web:e31fe7435fafcb5a450b7e",
  measurementId: "G-BSBHZCCXHT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const textarea = document.getElementById('textarea');
const sendButton = document.getElementById('sendButton');
const actionSelect = document.getElementById('actionSelect');

textarea.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // Prevent the default action of adding a new line
        sendButton.click(); // Simulate a click on the send button
    }
});

sendButton.addEventListener("click", () => {
    sendMessage(); // Call the sendMessage function
});

async function sendMessage() {
    const userInput = textarea.value;
    const chatbox = document.getElementById('chatbox');
    const action = actionSelect.value;

    if (userInput.trim() === '') return;

    try {
        // Determine the collection based on the selected action
        let collectionName;
        if (action === 'chat') {
            collectionName = 'conversations';
        } else if (action === 'addRule') {
            collectionName = 'rules';
        } else if (action === 'addFacts') {
            collectionName = 'facts';
        }

        // Save user message to the appropriate Firestore collection
        await addDoc(collection(db, collectionName), {
            sender: 'You',
            text: userInput,
            timestamp: serverTimestamp()
        });

        chatbox.innerHTML += `<div class="message user-message"><strong>You:</strong> ${userInput}</div>`;
        textarea.value = ''; // Clear the textarea

        const response = getResponse(userInput);
        chatbox.innerHTML += `<div class="message bot-message"><strong>Bot:</strong> ${response}</div>`;

        chatbox.scrollTop = chatbox.scrollHeight;
    } catch (error) {
        console.error("Error sending message: ", error);
    }
}

function getResponse(input) {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('hello')) {
        return 'Hello! How can I help you today?';
    } else if (lowerInput.includes('goodbye')) {
        return 'Goodbye! Have a great day!';
    } else {
        return 'I am sorry, I do not understand.';
    }
}

// Debugging: Check if elements are correctly selected
console.log("Textarea element: ", textarea);
console.log("Send button element: ", sendButton);
console.log("Action select element: ", actionSelect);