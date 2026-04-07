import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, Building } from "lucide-react";
import clsx from "clsx";
import { useNavigate } from "react-router";
import { SettingsGeneralSecurity } from "./SettingsGeneralSecurity";
import { SettingsBankConfig } from "./SettingsBankConfig";

interface SettingsProps {
  onLogout?: () => Promise<void> | void;
  activeTab?: string;
}

export const Settings: React.FC<SettingsProps> = ({
  onLogout,
  activeTab: initialTab,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (initialTab) {
      const cleanTabId = initialTab.replace("settings-", "");
      if (cleanTabId === "security") {
        setActiveTab("general");
      } else if (["general", "bank"].includes(cleanTabId)) {
        setActiveTab(cleanTabId);
      }
    }
  }, [initialTab]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-medium tracking-tight text-primary">
            Settings
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-white/10 overflow-x-auto no-scrollbar">
        {[
          { id: "general", label: "General & Security", icon: Globe },
          { id: "bank", label: "Bank Config", icon: Building },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              navigate(`/settings/${tab.id}`);
            }}
            className={clsx(
              "px-6 py-3 text-sm font-normal transition-all relative whitespace-nowrap flex items-center gap-2",
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5",
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === "general" && (
                <SettingsGeneralSecurity onLogout={onLogout} />
              )}
              {activeTab === "bank" && <SettingsBankConfig />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
