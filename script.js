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

// getFacts();
getRules();

const currentRules = [];
const currentFacts = [];

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
    let userInput = textarea.value.trim();
    const chatbox = document.getElementById('chatbox');
    const action = actionSelect.value;

    if (userInput === '') return;

    try {
        chatbox.innerHTML += `<div class="message user-message"><strong>You:</strong> ${userInput}</div>`;
        textarea.value = ''; // Clear the textarea
        
        userInput = userInput.toLowerCase(); // Convert input to lowercase

        if (userInput === 'display all rules') {
            getRules();
        } else if (userInput === 'display all facts') {
            getFacts();
        } else if (userInput.startsWith('delete rule')) {
            const ruleText = userInput.substring(12).trim();
            console.log('Rule to delete: ', ruleText);
            deleteRuleByText(ruleText);
        } else if (userInput.startsWith('display antecedent consequent')) {
            displayAntecedentConsequent();
        } else if (userInput.startsWith('delete fact')) {
            const factText = userInput.substring(12).trim();
            console.log('Fact to delete: ', factText);
            deleteFactByText(factText);
        } else if(userInput === 'generate answer') {
            generatAnswer();
        } else if(userInput === 'delete all facts') {
            deleteAllFacts();
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
    currentFacts.push(userInput.toLowerCase());
    // getFacts();
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
            currentFacts.push(fact);
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
            currentRules.push(rule); 
            rulesHtml += `<div class="message bot-message"><strong>Bot:</strong> ${rule}</div>`;
        });

        chatbox.innerHTML += rulesHtml;
        chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom of the chatbox
    } catch (error) {
        console.error("Error getting rules: ", error);
    }
}

console.log(currentRules);

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

async function deleteFactByText(factText) {
    try {
        // Create a query to find the document with the specified text
        const q = query(collection(db, 'facts'), where('text', '==', factText));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log('No matching fact found.');
            return;
        }

        // Delete the document(s) with the matching text
        querySnapshot.forEach(async (docSnapshot) => {
            await deleteDoc(doc(db, 'facts', docSnapshot.id));
        });
        let deletedFactHtml = '';

        deletedFactHtml += `<div class="message bot-message"><strong>Bot:</strong> ${'Fact deleted successfully.'}</div>`;
        chatbox.innerHTML += deletedFactHtml;
        chatbox.scrollTop = chatbox.scrollHeight;
        console.log('Fact deleted successfully.');
    } catch (error) {
        console.error("Error deleting Fact: ", error);
    }
}

async function deleteAllFacts() {
    try {
        const querySnapshot = await getDocs(collection(db, 'facts'));
        querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
        let deletedFactHtml = '';

        deletedFactHtml += `<div class="message bot-message"><strong>Bot:</strong> ${'All facts deleted successfully.'}</div>`;
        chatbox.innerHTML += deletedFactHtml;
        chatbox.scrollTop = chatbox.scrollHeight;
        console.log('All facts deleted successfully.');
    } catch (error) {
        console.error("Error deleting all facts: ", error);
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

async function generatAnswer() {
    // Fetch current rules and facts from the database
    const newRules = [];
    const newFacts = [];

    const querySnapshot_rules = await getDocs(collection(db, 'rules'));
    querySnapshot_rules.forEach(doc => {
        const rule = doc.data().text; // Assuming each document has a 'text' field for the rule
        newRules.push(rule);
    });

    const querySnapshot_facts = await getDocs(collection(db, 'facts'));
    querySnapshot_facts.forEach(doc => {
        const fact = doc.data().text; // Assuming each document has a 'text' field for the fact
        newFacts.push(fact);
    });

    forwardChaining(newRules, newFacts);
    getFacts();
}

function forwardChaining(newRules, newFacts)
{
    let addedNewFact = true;

    while (addedNewFact === true) {
        addedNewFact = false;

        newRules.forEach(rule => {
            // Separate antecedent and consequent
            const [antecedent, consequent] = rule.split('then').map(part => part.trim());

            // Remove "if" and the space after it from the antecedent
            const cleanedAntecedent = antecedent.replace(/^if\s+/, '');

            // Split the antecedent into individual conditions
            const conditions = cleanedAntecedent.split('and').map(condition => condition.trim());

            // Check if all conditions are present in newFacts
            const allConditionsMet = conditions.every(condition => newFacts.includes(condition));

            if (allConditionsMet && !newFacts.includes(consequent)) {
                newFacts.push(consequent);
                saveFact(consequent);
                console.log('New fact added: ', consequent);
                addedNewFact = true;
            }
        });
    }
}

async function backwardChaining(goal, newRules, newFacts) {
    // Helper function to check if a condition is met
    function isConditionMet(condition) {
        if (newFacts.includes(condition)) {
            return true;
        }

        for (const rule of newRules) {
            const [antecedent, consequent] = rule.split('then').map(part => part.trim());
            const cleanedAntecedent = antecedent.replace(/^if\s+/, '');
            const conditions = cleanedAntecedent.split('and').map(condition => condition.trim());

            if (consequent === condition) {
                const allConditionsMet = conditions.every(cond => isConditionMet(cond));
                if (allConditionsMet) {
                    newFacts.push(consequent);
                    saveFact(consequent);
                    console.log('New fact added: ', consequent);
                    return true;
                }
            }
        }
        return false;
    }

    // Start with the goal and work backward
    const goalMet = isConditionMet(goal);
    return goalMet ? goal : null;
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

document.addEventListener('DOMContentLoaded', () => {
    // JavaScript to handle dialog actions
    const dialog = document.getElementById('myDialog');
    const backwardChainingButton = document.getElementById('backwardChainingButton');
    const cancelButton = document.getElementById('cancelButton');
    const confirmButton = document.getElementById('confirmButton');

    // Input elements
    const temperatureInput = document.getElementById('temperatureInput');
    const nasalBreathingInput = document.getElementById('nasalBreathingInput');
    const headacheInput = document.getElementById('headacheInput');
    const coughInput = document.getElementById('coughInput');
    const soreThroatInput = document.getElementById('soreThroatInput');
    const antibioticsAllergyInput = document.getElementById('antibioticsAllergyInput');

    // Patient data object
    let patient = {
        temperature: 37.5,
        nasalBreathing: 'light',
        symptoms: [],
        soreThroat: false,
        antibioticsAllergy: false
    };

    backwardChainingButton.addEventListener('click', () => {
        dialog.showModal();
    });

    cancelButton.addEventListener('click', () => {
        dialog.close();
    });

    confirmButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent form submission
        patient.temperature = parseFloat(temperatureInput.value);
        patient.nasalBreathing = nasalBreathingInput.value;
        patient.symptoms = [];
        if (headacheInput.value === 'true') patient.symptoms.push('headache');
        if (coughInput.value === 'true') patient.symptoms.push('cough');
        patient.soreThroat = soreThroatInput.value === 'true';
        patient.antibioticsAllergy = antibioticsAllergyInput.value === 'true';

        console.log('Patient Data:', patient);
        dialog.close();
        // Call the backward chaining function with the patient data
        const result = diagnoseAndPrescribe(patient);
        console.log('Final Decision:', result);
        // Display the result in the chatbox
        const chatbox = document.getElementById('chatbox');
        chatbox.innerHTML += `<div class="message bot-message"><strong>Bot:</strong> ${result}</div>`;
        chatbox.scrollTop = chatbox.scrollHeight;
    });

    // Helper functions to evaluate the rules
    function hasFever(temperature) {
        if (temperature < 37) return 'no fever';
        if (temperature >= 37 && temperature < 38) return 'low fever';
        if (temperature >= 38) return 'high fever';
    }

    function checkNasalBreathing(breathing) {
        if (breathing === 'light') return 'nasal discharge';
        if (breathing === 'heavy') return 'sinus membranes swelling';
    }

    function hasCold(patient) {
        const fever = hasFever(patient.temperature);
        const hasNasalDischarge = checkNasalBreathing(patient.nasalBreathing) === 'nasal discharge';
        const hasHeadache = patient.symptoms.includes('headache');
        const hasCough = patient.symptoms.includes('cough');
        
        return (fever === 'low fever' && hasNasalDischarge && hasHeadache && hasCough);
    }

    function shouldTreat(patient) {
        const hasColdCondition = hasCold(patient);
        return hasColdCondition && patient.soreThroat;
    }

    function getMedication(patient) {
        if (!shouldTreat(patient)) {
            return 'Don’t treat, no medication needed';
        }

        if (patient.antibioticsAllergy) {
            return 'Give Tylenol';
        } else {
            return 'Give antibiotics';
        }
    }

    // Backward chaining process to determine if treatment and medication are needed
    function diagnoseAndPrescribe(patient) {
        const shouldGiveMedication = shouldTreat(patient);

        if (shouldGiveMedication) {
            return getMedication(patient);
        } else {
            return "No treatment needed";
        }
    }
});