// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
        const userInput = textarea.value;
        chatbox.innerHTML += `<div class="message user-message"><strong>You:</strong> ${userInput}</div>`;
        textarea.value = ''; // Clear the textarea
        
        if (userInput.toLowerCase() === 'display all rules') {
            getRules();
        } else if (userInput.toLowerCase() === 'display all facts') {
            getFacts();
        } else if (userInput.toLowerCase().startsWith('delete rule')) {
            const ruleText = userInput.substring(12).trim().toLowerCase();
            console.log('Rule to delete: ', ruleText);
            deleteRuleByText(ruleText);
        }
        else if (userInput.toLowerCase().startsWith('display antecedent consequent')) {
            displayAntecedentConsequent();
        } else {
            // Determine the collection based on the selected action
            if (action === 'chat') {
                saveChat(userInput);
            } else if (action === 'addRule') {
                saveRule(userInput);
            } else if (action === 'addFact') {
                saveFact(userInput);
            }
        
            const response = getResponse(userInput);
            chatbox.innerHTML += `<div class="message bot-message"><strong>Bot:</strong> ${response}</div>`;
        }
        
        chatbox.scrollTop = chatbox.scrollHeight;
    } catch (error) {
        console.error("Error sending message: ", error);
    }
}

function getResponse(input) {
    const action = actionSelect.value;
    if (action === 'chat') {
        return 'Hi! How can I help you today?'
    } else if (action === 'addRule') {
        return 'New rule added!'
    } else if (action === 'addFact') {
       return 'New fact added!'
    }
}

async function saveFact(userInput) {
    await addDoc(collection(db, 'facts'), {
        sender: 'You',
        text: userInput.toLowerCase(),
        timestamp: serverTimestamp()
    });
}

async function saveRule(userInput) {
    await addDoc(collection(db, 'rules'), {
        sender: 'You',
        text: userInput.toLowerCase(),
        timestamp: serverTimestamp()
    });
}

async function saveChat(userInput) {
    await addDoc(collection(db, 'chat'), {
        sender: 'You',
        text: userInput.toLowerCase(),
        timestamp: serverTimestamp()
    });
}

async function getFacts() {
    try {
        const querySnapshot = await getDocs(collection(db, 'facts'));
        let factsHtml = '';

        querySnapshot.forEach(doc => {
            const fact = doc.data().text; // Assuming each document has a 'text' field for the fact
            factsHtml += `<div class="message bot-message"><strong>Bot:</strong> ${fact}</div>`;
        });

        chatbox.innerHTML += factsHtml;
        chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom of the chatbox
    } catch (error) {
        console.error("Error getting facts: ", error);
    }
}

async function getRules() {
    try {
        const querySnapshot = await getDocs(collection(db, 'rules'));
        let rulesHtml = '';

        querySnapshot.forEach(doc => {
            const rule = doc.data().text; // Assuming each document has a 'text' field for the rule
            rulesHtml += `<div class="message bot-message"><strong>Bot:</strong> ${rule}</div>`;
        });

        chatbox.innerHTML += rulesHtml;
        chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom of the chatbox
    } catch (error) {
        console.error("Error getting rules: ", error);
    }
}

async function deleteRuleByText(ruleText) {
    try {
        // Create a query to find the document with the specified text
        const q = query(collection(db, 'rules'), where('text', '==', ruleText));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log('No matching rule found.');
            return;
        }

        // Delete the document(s) with the matching text
        querySnapshot.forEach(async (docSnapshot) => {
            await deleteDoc(doc(db, 'rules', docSnapshot.id));
        });
        let deletedRuleHtml = '';

        deletedRuleHtml += `<div class="message bot-message"><strong>Bot:</strong> ${'Rule deleted successfully.'}</div>`;
        chatbox.innerHTML += deletedRuleHtml;
        chatbox.scrollTop = chatbox.scrollHeight;
        console.log('Rule deleted successfully.');
    } catch (error) {
        console.error("Error deleting rule: ", error);
    }
}

async function displayAntecedentConsequent() {
    try {
        // Fetch all rules from the database
        const rulesSnapshot = await getDocs(collection(db, 'rules'));

        // Process each rule
        rulesSnapshot.forEach(doc => {
            const rule = doc.data().text.toLowerCase();
            const [antecedent, consequent] = rule.split('then').map(part => part.trim());

            console.log("Antecedent:", antecedent); // e.g., "condition1 && condition2"
            console.log("Consequent:", consequent); // e.g., "conclusion"
            
            let displayHtml = '';

            displayHtml += `<div class="message bot-message"><strong>Bot:</strong> Antecedent: ${antecedent}<br>Consequent: ${consequent}</div>`;
            chatbox.innerHTML += displayHtml;
            chatbox.scrollTop = chatbox.scrollHeight;
        });
    } catch (error) {
        console.error("Error fetching rules: ", error);
    }
}

// sample code for splitting antecedent and consequent
// const rule = "condition1 && condition2 => conclusion";
// const [antecedent, consequent] = rule.split('=>').map(part => part.trim());

// console.log("Antecedent:", antecedent); // "condition1 && condition2"
// console.log("Consequent:", consequent); // "conclusion"


// Debugging: Check if elements are correctly selected
console.log("Textarea element: ", textarea);
console.log("Send button element: ", sendButton);
console.log("Action select element: ", actionSelect);