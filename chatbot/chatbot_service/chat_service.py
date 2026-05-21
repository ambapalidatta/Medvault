import json
import re
from thefuzz import process

# Load the knowledge base
with open('knowledge_base.json', 'r', encoding='utf-8') as f:
    knowledge_base = json.load(f)

def get_intent(user_message):
    """
    Determines the user's intent based on keywords.
    """
    user_message = user_message.lower()
    
    # High priority for safety-critical intents
    if any(keyword in user_message for keyword in ["problem what medicine", "what should i take for", "diagnose me", "what medicine to take", "i am having this problem"]):
        return "MEDICAL_ADVICE_SOUGHT"
    if any(keyword in user_message for keyword in ["fever and sore throat", "chest pain", "stomach pain for 3 days", "dizzy and weak", "skin rashes", "symptoms", "triage"]):
        return "SYMPTOMS_TRIAGE"
    if any(keyword in user_message for keyword in ["lab report", "test results", "cbc report", "high cholesterol", "thyroid", "kidney function", "fatigue", "blood test", "explain"]):
        return "LAB_REPORTS_TESTS"

    # Other intents
    if any(keyword in user_message for keyword in ["hi", "hello", "hey", "greeting"]):
        return "GREETING"
    if any(keyword in user_message for keyword in ["doctor", "cardiologist", "physician", "dentist", "surgeon", "pediatrician", "find a doctor", "search drs", "specialist", "heart doctor", "child doctor", "teeth doctor", "general doctor"]):
        return "DOCTOR_SEARCH"
    if any(keyword in user_message for keyword in ["book", "appointment", "cancel", "schedule", "reschedule", "booking status", "approved", "pending", "how many days"]):
        return "APPOINTMENT_HELP"
    if any(keyword in user_message for keyword in ["contact", "email", "phone", "location", "address", "working hours", "support", "clinic hours"]):
        return "GENERAL_QUERIES" # Combined with CONTACT_INQUIRY
    if "side effect" in user_message or "cause acidity" in user_message or "make me sleepy" in user_message or "affect my kidneys" in user_message or "safe for long-term" in user_message:
        return "SIDE_EFFECT_INQUIRY"
    if any(keyword in user_message for keyword in ["interaction", "together", "advil", "tylenol", "aspirin", "ibuprofen", "warfarin", "lisinopril", "can i take", "what will happen", "combination"]):
        return "MEDICINE_SAFETY"
    if any(keyword in user_message for keyword in ["issue", "problem", "can't upload", "payment failed", "wrong appointment", "prescription not visible", "resolve", "submitted an issue", "track status"]):
        return "REPORT_ISSUE"
    if any(keyword in user_message for keyword in ["upload documents", "view prescriptions", "update profile"]):
        return "GENERAL_QUERIES" # Combined with CONTACT_INQUIRY
        
    return "GENERAL_FAQ"

def find_doctor(query):
    """
    Finds a doctor based on specialization and returns fees.
    """
    doctors = knowledge_base["doctors"]
    query = query.lower()
    
    # First, try a direct keyword match in the user's query
    matching_doctors = []
    for doctor in doctors:
        if doctor['specialization'].lower() in query:
            matching_doctors.append(doctor)
    
    if matching_doctors:
        if len(matching_doctors) == 1:
            doc = matching_doctors[0]
            return f"Yes, {doc['name']} is our {doc['specialization']}. Consultation fee: ₹{doc['fees']}."
        else:
            # Multiple doctors with same specialization
            response = f"We have {len(matching_doctors)} {matching_doctors[0]['specialization']}s available:\n"
            for doc in matching_doctors:
                response += f"• {doc['name']} - ₹{doc['fees']}\n"
            return response.strip()

    # If no direct match, extract the likely specialization from the query
    all_specializations = list(set([d['specialization'] for d in doctors]))
    best_match, score = process.extractOne(query, all_specializations)

    if score > 70: # Confidence threshold
        found_docs = [d for d in doctors if d['specialization'] == best_match]
        if found_docs:
            if len(found_docs) == 1:
                doc = found_docs[0]
                return f"Yes, {doc['name']} is our {best_match}. Consultation fee: ₹{doc['fees']}."
            else:
                response = f"We have {len(found_docs)} {best_match}s available:\n"
                for doc in found_docs:
                    response += f"• {doc['name']} - ₹{doc['fees']}\n"
                return response.strip()

    return "I couldn't find a doctor with that exact specialization. We have General Physicians, Dentists, Pediatricians, and Cardiologists. Would you like to search for one of these?"


def get_faq_answer(query):
    """
    Finds the best FAQ answer using fuzzy matching.
    """
    faqs = knowledge_base["faqs"]
    questions = [faq['q'] for faq in faqs]
    best_match, score = process.extractOne(query, questions)
    
    if score > 75: # Increased confidence threshold for FAQs
        for faq in faqs:
            if faq['q'] == best_match:
                return faq['a']
    return None 

def resolve_drug_names(query):
    """
    Normalizes brand names to generics and extracts recognized drugs.
    """
    all_interactions = knowledge_base["drug_interactions"]
    all_side_effects = knowledge_base["side_effects"]
    all_known_drugs_generics = set(all_interactions.keys()) | set(all_side_effects.keys())
    
    synonyms = knowledge_base.get("drug_synonyms", {})
    
    tokens = re.findall(r'\b\w+\b', query.lower()) # Use word boundaries for better tokenization
    
    found_drugs = []
    
    for token in tokens:
        if token in all_known_drugs_generics:
            found_drugs.append(token)
        elif token in synonyms:
            generic = synonyms[token]
            if generic in all_known_drugs_generics: # Ensure resolved generic is also a known drug
                found_drugs.append(generic)
            
    return list(set(found_drugs)) # Remove duplicates

def check_medicine_interaction(query):
    """
    Checks for interactions between two drugs.
    """
    interactions_db = knowledge_base["drug_interactions"]
    drugs_mentioned = resolve_drug_names(query)

    if len(drugs_mentioned) < 2:
        return f"I detected {', '.join([d.capitalize() for d in drugs_mentioned]) if drugs_mentioned else 'no medicines'}. Please mention at least two medicines (like 'Aspirin and Warfarin') to check for interactions."

    # Sort drugs to handle interactions like (A,B) or (B,A) consistently
    drugs_mentioned.sort()
    
    drug1 = drugs_mentioned[0]
    drug2 = drugs_mentioned[1]
    
    response = ""
    # Check interaction in both directions
    if drug1 in interactions_db and drug2 in interactions_db[drug1]:
        response = interactions_db[drug1][drug2]
    elif drug2 in interactions_db and drug1 in interactions_db[drug2]:
        response = interactions_db[drug2][drug1]

    if response:
        return response
    
    return f"No specific interaction found between {drug1.capitalize()} and {drug2.capitalize()} in our database. Always consult a doctor before combining medications. If symptoms worsen or don’t improve, consult a doctor."

def get_side_effects(query):
    """
    Retrieves side effect information for a given drug.
    """
    side_effects_db = knowledge_base["side_effects"]
    drugs_mentioned = resolve_drug_names(query)

    if not drugs_mentioned:
        return "I could not identify a specific medicine in your question. Please ask about one medicine at a time, for example: 'What are the side effects of Ibuprofen?' If symptoms worsen or don’t improve, consult a doctor."
    
    drug = drugs_mentioned[0]
    if drug in side_effects_db:
        return f"Side effects for {drug.capitalize()}: {side_effects_db[drug]}\n\nIf symptoms worsen or don’t improve, consult a doctor."
    else:
        return f"I do not have detailed side effect information for {drug.capitalize()} in my current database. Please consult a doctor or pharmacist for comprehensive information. If symptoms worsen or don’t improve, consult a doctor."

def get_symptoms_triage(query):
    """
    Provides guidance for symptoms.
    """
    symptoms_db = knowledge_base["symptoms_triage"]
    
    # Try direct matches first
    for symptom, advice in symptoms_db.items():
        if symptom in query.lower():
            return f"{advice}\n\nIf symptoms worsen or don’t improve, consult a doctor."

    # Fallback to general guidance
    return "When experiencing symptoms, it's best to observe them closely. I cannot diagnose conditions, but I can offer general advice. Describe your symptoms briefly, and I can suggest which type of doctor might be appropriate. For serious or sudden symptoms, please seek immediate medical attention. If symptoms worsen or don’t improve, consult a doctor."

def get_lab_reports_tests(query):
    """
    Provides general explanation for lab reports/tests.
    """
    lab_db = knowledge_base["lab_reports_tests"]

    for report_type, explanation in lab_db.items():
        if report_type in query.lower():
            return f"{explanation}\n\nPlease remember that I am an AI and cannot interpret your specific results. Always consult your doctor for a detailed explanation and personalized advice. If symptoms worsen or don’t improve, consult a doctor."
    
    return "Interpreting lab reports requires a medical professional. I can give general explanations for common tests like a CBC or lipid profile. Please ask me about a specific test. Always consult your doctor for a detailed explanation of your results. If symptoms worsen or don’t improve, consult a doctor."


def get_chatbot_response(user_message: str):
    """
    Main function to get a response from the chatbot.
    """
    intent = get_intent(user_message)
    
    if user_message == "INITIAL_GREETING":
        return {
            "message": "Hello! I'm MedBuddy, your MedVault assistant. I can help you find doctors, check medicine interactions, or answer booking questions. What can I help you with today?",
            "suggestions": [
                "Medicine Check",
                "Symptoms & Triage",
                "Drug Side Effects",
                "Appointment Help",
                "Doctor Search",
                "Report an Issue",
                "Lab Reports & Tests",
                "General Queries"
            ]
        }
    
    if intent == "MEDICAL_ADVICE_SOUGHT":
        return "As MedBuddy, I cannot provide medical advice or diagnoses. My purpose is to offer general information and direct you to appropriate resources. Please consult with a qualified doctor for any health concerns, diagnoses, or before taking any medication. Would you like me to help you find a doctor or perhaps check general side effects of a medicine? If symptoms worsen or don’t improve, consult a doctor."

    if intent == "GREETING":
        return {
            "message": "Hello there! How can I assist you with your health queries today?",
            "suggestions": [
                "Medicine Check",
                "Symptoms & Triage",
                "Drug Side Effects",
                "Appointment Help",
                "Doctor Search",
                "Report an Issue",
                "Lab Reports & Tests",
                "General Queries"
            ]
        }

    if intent == "DOCTOR_SEARCH":
        response = find_doctor(user_message)
        # If a doctor is found, suggest booking
        if "Yes," in response:
            return {
                "message": response + " Would you like to book an appointment with them?",
                "action": "BOOK_NOW",
                "suggestions": ["Book Appointment", "View Doctor Profile"]
            }
        # If no specific doctor found, suggest searching by specialty
        return {
            "message": response, # This will be "I couldn't find a doctor..."
            "suggestions": ["Find a General Physician", "Search Cardiologists", "Search Pediatricians", "Find a Specialist by Symptom"]
        }
    
    if intent == "APPOINTMENT_HELP":
        faq_answer = get_faq_answer(user_message)
        if faq_answer:
            return faq_answer
        return {
            "message": "You can manage your appointments through the 'My Appointments' section in your dashboard. Would you like to book a new one?",
            "action": "BOOK_NOW",
            "suggestions": ["Go to Booking Page", "How to cancel appointment?", "What is my appointment status?"]
        }

    if intent == "GENERAL_QUERIES":
        faq_answer = get_faq_answer(user_message)
        if faq_answer:
            return faq_answer
        info = knowledge_base['business_info']
        return f"You can contact us via email at {info['email']} or by phone at {info['phone']}. Our office is located in {info['location']}. If symptoms worsen or don’t improve, consult a doctor."

    if intent == "SIDE_EFFECT_INQUIRY":
        return get_side_effects(user_message)
        
    if intent == "MEDICINE_SAFETY":
        return check_medicine_interaction(user_message)

    if intent == "REPORT_ISSUE":
        faq_answer = get_faq_answer(user_message)
        if faq_answer:
            return faq_answer
        return "Please describe your issue in more detail, or you can use the 'Report an Issue' feature in your dashboard. Would you like our contact information? If symptoms worsen or don’t improve, consult a doctor."
        
    if intent == "SYMPTOMS_TRIAGE":
        return get_symptoms_triage(user_message)

    if intent == "LAB_REPORTS_TESTS":
        return get_lab_reports_tests(user_message)

    # Fallback to General FAQ if no specific intent or direct FAQ match
    faq_answer = get_faq_answer(user_message)
    if faq_answer:
        return faq_answer

    # Final fallback response
    info = knowledge_base['business_info']
    return f"I'm not sure how to answer that specific question. For general guidance, you can explore the categories below or contact our support team at {info['phone']}. If symptoms worsen or don’t improve, consult a doctor."