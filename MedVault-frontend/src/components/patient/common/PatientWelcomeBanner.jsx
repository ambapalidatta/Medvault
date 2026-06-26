import { getISTGreeting } from "../../../utils/date.js";

export default function PatientWelcomeBanner({ user, profileData }) {
  return (
    <div className="flex items-center gap-6 bg-gradient-to-r from-purple-600 to-brand-purple rounded-3xl shadow-lg p-8 mb-10 text-white animate-fade-in">
      <img
        src={
          user.profilePictureUrl ||
          `https://placehold.co/128x128/B8BDFF/7209B7?text=${user.name?.charAt(0)}`
        }
        alt="Profile"
        className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
      />
      <div>
        <h2 className="text-4xl font-bold mb-2">
          {getISTGreeting()}, {profileData.firstName || user.name}!
        </h2>
        <p className="text-purple-100 text-lg opacity-90 italic">
          Let's take care of your health today.
        </p>
      </div>
    </div>
  );
}
