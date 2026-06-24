// Chatbot Service

const FAQ_DATABASE = [
    {
        keywords: ["how to book", "book appointment", "schedule", "appointment"],
        answer: "To book an appointment, go to the Patient Dashboard, select 'Book Appointment', select your preferred Doctor and date/time slot, and click 'Confirm'. Alternatively, the Receptionist can register you directly at the hospital counter."
    },
    {
        keywords: ["check token", "my token", "queue status", "waiting time"],
        answer: "You can track your token number, current queue position, and estimated waiting time in real-time from the Patient Dashboard. The live status is also displayed on the main Queue Dashboard in the lobby."
    },
    {
        keywords: ["emergency", "critical", "severe pain", "sos"],
        answer: "If you are experiencing a life-threatening emergency (such as severe chest pain, major breathing difficulties, or severe trauma), please notify the Receptionist immediately. They can trigger the Emergency Override, placing you at the absolute front of the queue."
    },
    {
        keywords: ["what is queuecure", "how does it work", "about"],
        answer: "QueueCure-AI is an AI-powered Hospital Queue Management System. It uses smart scheduling, real-time priority routing, and predictive algorithms to calculate estimated wait times, organize patient queues dynamically, and reduce overall waiting room congestion."
    },
    {
        keywords: ["cancel appointment", "reschedule"],
        answer: "You can cancel or reschedule appointments directly from your Patient Dashboard, or request assistance from the Reception Desk."
    }
];

const SYMPTOM_SPECIALIZATION_MAP = [
    {
        symptoms: ["chest pain", "heart racing", "palpitation", "high blood pressure", "cardiac", "angina"],
        specialty: "Cardiology",
        guidance: "Please seek medical attention. If chest pain is crushing or radiates to your left arm or jaw, request an EMERGENCY priority token immediately.",
        doctors: ["Dr. Sarah Jenkins", "Dr. David Vance"]
    },
    {
        symptoms: ["headache", "dizziness", "seizure", "numbness", "tremor", "migraine", "stroke"],
        specialty: "Neurology",
        guidance: "Consult a neurologist for persistent neurological symptoms. Check for weakness on one side of the face/body as an emergency indicator.",
        doctors: ["Dr. Robert Chen", "Dr. Helen Rostova"]
    },
    {
        symptoms: ["fever", "cough", "flu", "cold", "sore throat", "body ache", "fatigue", "general checkup"],
        specialty: "General Medicine",
        guidance: "Rest, stay hydrated, and consult a general physician. If fever exceeds 103°F or lasts more than 3 days, get a consultation.",
        doctors: ["Dr. John Doe", "Dr. Emily Smith", "Dr. Alan Grant"]
    },
    {
        symptoms: ["skin rash", "itching", "acne", "eczema", "burn", "psoriasis", "mole"],
        specialty: "Dermatology",
        guidance: "Avoid scratching the area and apply soothing lotion. Get a professional dermatological scan to diagnose underlying skin conditions.",
        doctors: ["Dr. Lisa Ray", "Dr. Marcus Cole"]
    },
    {
        symptoms: ["joint pain", "bone fracture", "sprain", "backache", "arthritis", "neck pain", "muscle tear"],
        specialty: "Orthopedics",
        guidance: "Apply ice to reduce swelling. Avoid putting weight on affected joints until examined by an orthopedic specialist.",
        doctors: ["Dr. Arthur Pendelton", "Dr. Diana Prince"]
    },
    {
        symptoms: ["stomach ache", "acid reflux", "nausea", "vomiting", "diarrhea", "constipation", "bloating", "indigestion"],
        specialty: "Gastroenterology",
        guidance: "Stick to a bland diet (BRAT) and avoid dairy or spicy foods. Seek urgent care if there is blood in vomit or stool.",
        doctors: ["Dr. Gregory House", "Dr. Sanjay Gupta"]
    },
    {
        symptoms: ["child", "baby", "pediatric", "immunization", "toddler"],
        specialty: "Pediatrics",
        guidance: "Consult our dedicated pediatrician for infant care, fever, and routine immunizations.",
        doctors: ["Dr. Alice Walker", "Dr. Bruce Banner"]
    }
];

export const getFAQList = async () => {
    return FAQ_DATABASE.map(faq => ({
        question: faq.keywords[0].toUpperCase() + faq.keywords[0].slice(1),
        keywords: faq.keywords,
        answer: faq.answer
    }));
};

export const queryChatbot = async (message) => {
    const queryLower = message.toLowerCase();

    // 1. Check if Gemini API is available
    if (process.env.GEMINI_API_KEY) {
        try {
            // Call Gemini API dynamically
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            {
                                role: "user",
                                parts: [
                                    {
                                        text: `You are QueueCure AI, a helpful virtual hospital assistant. 
                                        Answer the patient's query. Provide brief, polite, and clear responses.
                                        If the user describes symptoms, suggest the appropriate medical specialization (e.g. Cardiology, Neurology, Pediatrics, Dermatology, Gastroenterology, Orthopedics, General Medicine) and alert them to seek immediate emergency care if they describe life-threatening situations (like crushing chest pain, severe breathing problems).
                                        User query: ${message}`
                                    }
                                ]
                            }
                        ]
                    })
                }
            );

            const json = await response.json();
            if (json.candidates && json.candidates[0]?.content?.parts[0]?.text) {
                return {
                    answer: json.candidates[0].content.parts[0].text,
                    source: "Gemini AI"
                };
            }
        } catch (error) {
            console.log("Gemini API call failed, falling back to local NLP engine:", error.message);
        }
    }

    // 2. Check Local FAQs
    for (const faq of FAQ_DATABASE) {
        if (faq.keywords.some(keyword => queryLower.includes(keyword))) {
            return {
                answer: faq.answer,
                type: "FAQ",
                source: "QueueCure Engine"
            };
        }
    }

    // 3. Check Symptom Database & Doctor Specialty Router
    for (const item of SYMPTOM_SPECIALIZATION_MAP) {
        if (item.symptoms.some(sym => queryLower.includes(sym))) {
            return {
                answer: `Based on your symptoms, we recommend consulting a specialist in **${item.specialty}**.\n\n**Guidance:** ${item.guidance}\n\n**Available Specialists:** ${item.doctors.join(", ")}. You can register for their queue or book an appointment on your dashboard.`,
                specialization: item.specialty,
                recommendedDoctors: item.doctors,
                type: "SymptomGuidance",
                source: "QueueCure Engine"
            };
        }
    }

    // 4. Default Greeting / Fallback
    return {
        answer: "Hello! I am your QueueCure AI Virtual Assistant. I can help answer hospital FAQs, check your symptoms, or suggest the appropriate doctor specialization. What seems to be the issue today?",
        type: "Fallback",
        source: "QueueCure Engine"
    };
};
