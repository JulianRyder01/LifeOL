import { useState, useEffect } from 'react';
import { UserConfig } from '../../types/app.types';
import { loadUserConfig, getInitialUserConfig, saveUserConfig } from '../../utils/userConfig';

export const useUser = () => {
  const [userConfig, setUserConfig] = useState<UserConfig>(() => {
    return loadUserConfig() || getInitialUserConfig();
  });

  const [selectedTitles, setSelectedTitles] = useState<string[]>(() => {
    const savedTitles = localStorage.getItem('lifeol_selected_titles');
    return savedTitles ? JSON.parse(savedTitles) : [];
  });

  const [showFirstTimeGuide, setShowFirstTimeGuide] = useState<boolean>(() => {
    const guideShown = localStorage.getItem('lifeol_first_time_guide_shown');
    return !guideShown; // Show guide if it hasn't been shown before
  });

  useEffect(() => {
    saveUserConfig(userConfig);
  }, [userConfig]);

  useEffect(() => {
    localStorage.setItem('lifeol_selected_titles', JSON.stringify(selectedTitles));
  }, [selectedTitles]);

  const updateUserConfig = (newConfig: UserConfig) => {
    setUserConfig(newConfig);
  };

  const updateSelectedTitles = (titleIds: string[]) => {
    setSelectedTitles(titleIds);
  };

  const hideFirstTimeGuide = () => {
    setShowFirstTimeGuide(false);
    localStorage.setItem('lifeol_first_time_guide_shown', 'true');
  };

  return {
    userConfig,
    setUserConfig,
    selectedTitles,
    setSelectedTitles,
    showFirstTimeGuide,
    setShowFirstTimeGuide,
    updateUserConfig,
    updateSelectedTitles,
    hideFirstTimeGuide
  };
};