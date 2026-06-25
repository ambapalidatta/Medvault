import { useEffect, useRef, useState } from "react";

const CHATBOT_API_BASE_URL = import.meta.env.VITE_CHATBOT_API_BASE_URL || "http://localhost:8001";

// --- Chat Widget Component ---
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategoryPhrases, setActiveCategoryPhrases] = useState(null); // New state for category phrases
  const chatBoxRef = useRef(null);

  // Define chatbot categories and phrases
  const chatbotCategories = [
    {
      heading: "Medicine Check",
      phrases: [
        "I took Aspirin and Ibuprofen together — is it safe?",
        "Are there interactions between Warfarin and Amiodarone?",
        "I took two medicines at the same time, what will happen?",
        "Can I take Metformin after taking Paracetamol?",
        "Does this medicine interact with my current treatment?",
      ],
    },
    {
      heading: "Symptoms & Triage",
      phrases: [
        "I have fever and sore throat — which doctor should I see?",
        "I am having chest pain — what should I do?",
        "I have stomach pain for 3 days — any suggestions?",
        "I feel dizzy and weak — is it serious?",
        "I have skin rashes — which department should I visit?",
      ],
    },
    {
      heading: "Drug Side Effects",
      phrases: [
        "What are the side effects of Paracetamol?",
        "Does Ibuprofen cause acidity?",
        "Is Metformin safe for long-term use?",
        "Will this medicine make me sleepy?",
        "Can this medicine affect my kidneys?",
      ],
    },
    {
      heading: "Appointment Help",
      phrases: [
        "I booked an appointment — when will it be approved?",
        "How many days until my appointment?",
        "Can I reschedule my appointment?",
        "What is the status of my booking?",
        "My appointment still shows pending — why?",
      ],
    },
    {
      heading: "Doctor Search",
      phrases: [
        "Find a General Physician near me.",
        "Show Dermatologists within 10 km.",
        "Search for Cardiologists available today.",
        "Who is the best Orthopedic doctor near me?",
        "Find doctors by specialty.",
      ],
    },
    {
      heading: "Report an Issue",
      phrases: [
        "I submitted an issue — when will it be resolved?",
        "I can’t upload my lab report — please help.",
        "My payment failed — what should I do?",
        "I got the wrong appointment time.",
        "My prescription is not visible in the app.",
      ],
    },
    {
      heading: "Lab Reports & Tests",
      phrases: [
        "Explain my CBC report.",
        "What does high cholesterol mean?",
        "My thyroid (TSH) is high — should I be worried?",
        "Help me understand my kidney function test.",
        "What tests should I do for fatigue?",
      ],
    },
    {
      heading: "General Queries",
      phrases: [
        "What are your clinic working hours?",
        "How do I upload documents?",
        "How to contact support?",
        "Where can I view my prescriptions?",
        "How to update my profile?",
      ],
    },
  ];

  const fetchInitialGreeting = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${CHATBOT_API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "INITIAL_GREETING" }),
      });
      if (!response.ok) throw new Error("Failed to fetch initial greeting");
      const data = await response.json();
      const welcomeMessage = { sender: "bot", text: data.reply }; // Initial greeting doesn't send specific suggestions now
      setMessages([welcomeMessage]);
    } catch (error) {
      setMessages([{ sender: "bot", text: "Welcome! How can I help?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInitialGreeting();
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setActiveCategoryPhrases(null); // Close phrases drawer after sending
    setIsLoading(true);

    try {
      const response = await fetch(`${CHATBOT_API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const botMessage = {
        sender: "bot",
        text: data.reply,
        action: data.action,
      }; // Suggestions are now handled by UI
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        sender: "bot",
        text: "Sorry, I am having trouble connecting. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handlePhraseClick = (phrase) => {
    setInputValue(phrase);
    setActiveCategoryPhrases(null); // Close drawer after selecting a phrase
    // Optionally, send the message directly:
    // sendMessage(phrase);
  };

  const handleCategoryClick = (categoryHeading) => {
    if (
      activeCategoryPhrases &&
      activeCategoryPhrases.heading === categoryHeading
    ) {
      setActiveCategoryPhrases(null); // Close if already open
    } else {
      const category = chatbotCategories.find(
        (cat) => cat.heading === categoryHeading,
      );
      setActiveCategoryPhrases(category);
    }
  };

  const handleActionClick = (action) => {
    if (action === "BOOK_NOW") {
      // This will now trigger the main app's routing to the patient registration flow
      window.location.hash = "patient";
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        {/* Floating message bubble - now above the button */}
        <div className="bg-white px-4 py-2 rounded-2xl shadow-xl border-2 border-brand-purple/30 max-w-xs">
          <p className="text-sm font-semibold text-slate-700">
            How may I help you?
          </p>
        </div>
        {/* Chat button */}
        <button
          onClick={() => setIsOpen(true)}
          className="bg-brand-purple text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:bg-purple-700 transition-all hover:scale-110"
        >
          <img
            src="/medbuddy_icon.svg"
            alt="MedBuddy Icon"
            className="w-8 h-8"
          />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border-2 border-brand-purple/50">
      {/* Header */}
      <div className="bg-brand-purple text-white p-4 rounded-t-xl flex justify-between items-center">
        <h3 className="font-bold text-lg">MedBuddy</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:text-purple-200"
        >
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      {/* Messages */}
      <div
        ref={chatBoxRef}
        className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4"
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <div
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded-xl max-w-xs ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-800"}`}
              >
                <p>{msg.text}</p>
                {msg.action && (
                  <button
                    onClick={() => handleActionClick(msg.action)}
                    className="mt-2 bg-white text-brand-purple font-bold py-2 px-4 rounded-lg shadow hover:bg-slate-100"
                  >
                    Book Now
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-xl bg-slate-200 text-slate-500">
              ...
            </div>
          </div>
        )}
      </div>

      {/* Master Headings (Categories) */}
      <div className="p-2 bg-white border-t border-b overflow-x-auto whitespace-nowrap scrollbar-hide">
        {chatbotCategories.map((category) => (
          <button
            key={category.heading}
            onClick={() => handleCategoryClick(category.heading)}
            className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ease-in-out m-1
                                ${
                                  activeCategoryPhrases &&
                                  activeCategoryPhrases.heading ===
                                    category.heading
                                    ? "bg-brand-purple text-white shadow-lg"
                                    : "bg-purple-100 text-brand-purple hover:bg-purple-200"
                                }`}
          >
            {category.heading}
          </button>
        ))}
      </div>

      {/* Suggested Phrases Drawer */}
      {activeCategoryPhrases && (
        <div className="p-4 bg-white shadow-inner border-t">
          <ul className="space-y-2">
            {activeCategoryPhrases.phrases.map((phrase, index) => (
              <li key={index}>
                <button
                  onClick={() => handlePhraseClick(phrase)}
                  className="w-full text-left text-sm text-slate-700 hover:text-brand-purple hover:bg-slate-50 p-2 rounded-lg transition-colors"
                >
                  • {phrase}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleFormSubmit}
        className="p-4 border-t bg-white rounded-b-xl"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-brand-purple"
            placeholder="Ask me anything..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-brand-purple text-white px-4 rounded-lg font-bold hover:bg-purple-700"
            disabled={isLoading}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </form>
    </div>
  );

}
