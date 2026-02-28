import { useState, useEffect } from "react";
import { BottomNav } from "./components/BottomNav";
import { OnboardingGuide } from "./components/OnboardingGuide";
import { AIAssistant } from "./components/pages/AIAssistant";
import { PatientList } from "./components/pages/PatientList";
import { RecordsList } from "./components/pages/RecordsList";
import { Settings } from "./components/pages/Settings";

export default function App() {
  const [currentTab, setCurrentTab] = useState("ai");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem(
      "hasSeenOnboarding",
    );
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <OnboardingGuide onComplete={handleOnboardingComplete} />
    );
  }

  const renderContent = () => {
    switch (currentTab) {
      case "ai":
        return <AIAssistant />;
      case "patients":
        return <PatientList />;
      case "records":
        return <RecordsList />;
      case "settings":
        return <Settings />;
      default:
        return <AIAssistant />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
      {renderContent()}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />
    </div>
  );
}