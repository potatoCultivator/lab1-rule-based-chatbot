// Input data
const patient = {
    temperature: 37.5, // example temperature
    nasalBreathing: 'light', // 'light' or 'heavy'
    symptoms: ['headache', 'cough'], // example symptoms
    soreThroat: false, // boolean value for sore throat
    antibioticsAllergy: true // boolean value for antibiotics allergy
};

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

// Output result
const result = diagnoseAndPrescribe(patient);
console.log(result);
