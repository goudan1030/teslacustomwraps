import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { VEHICLE_MODELS, VehicleModel } from '../types/vehicle';
import { urlToBase64 } from '../utils/image';

interface VehicleSelectorProps {
  onVehicleSelect: (base64Image: string, vehicle: VehicleModel) => void;
  selectedVehicleId?: string | null;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({ 
  onVehicleSelect, 
  selectedVehicleId 
}) => {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const [loadingVehicle, setLoadingVehicle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isDark = theme === 'dark';

  // Group vehicles by category
  const groupedVehicles = VEHICLE_MODELS.reduce((acc, vehicle) => {
    const category = vehicle.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(vehicle);
    return acc;
  }, {} as Record<string, VehicleModel[]>);

  const handleVehicleClick = async (vehicle: VehicleModel) => {
    setLoadingVehicle(vehicle.id);
    setError(null);

    try {
      // Try to load from GitHub raw URL
      // The template file is named template.png in the GitHub repository
      const tryUrls = [
        vehicle.templateUrl,
        `https://raw.githubusercontent.com/teslamotors/custom-wraps/master/${vehicle.githubPath}/template.png`,
      ];

      let base64Image: string | null = null;
      let lastError: Error | null = null;

      for (const url of tryUrls) {
        try {
          base64Image = await urlToBase64(url);
          break;
        } catch (err) {
          lastError = err as Error;
          continue;
        }
      }

      if (!base64Image) {
        throw lastError || new Error('Failed to load template');
      }

      onVehicleSelect(base64Image, vehicle);
      setLoadingVehicle(null);
    } catch (err: any) {
      console.error('Error loading vehicle template:', err);
      setError(err.message || t('main.failedToLoadTemplate'));
      setLoadingVehicle(null);
    }
  };

  const getCategoryName = (category: string): string => {
    const names: Record<string, { en: string; zh: string }> = {
      cybertruck: { en: 'Cybertruck', zh: 'Cybertruck' },
      model3: { en: 'Model 3', zh: 'Model 3' },
      modely: { en: 'Model Y', zh: 'Model Y' }
    };
    return language === 'zh' ? names[category]?.zh || category : names[category]?.en || category;
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedVehicles).map(([category, vehicles]) => (
        <div key={category} className="space-y-3">
          <h3 className={`text-sm font-semibold uppercase tracking-wider ${
            isDark ? 'text-zinc-400' : 'text-zinc-600'
          }`}>
            {getCategoryName(category)}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {vehicles.map((vehicle) => {
              const isSelected = selectedVehicleId === vehicle.id;
              const isLoading = loadingVehicle === vehicle.id;
              
              return (
                <button
                  key={vehicle.id}
                  onClick={() => handleVehicleClick(vehicle)}
                  disabled={isLoading}
                  className={`group relative p-3 rounded border text-left transition-all duration-200 ${
                    isSelected
                      ? isDark
                        ? 'border-white bg-zinc-800 text-white'
                        : 'border-black bg-zinc-100 text-black'
                      : isDark
                        ? 'border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900/80'
                        : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50'
                  } ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {language === 'zh' ? vehicle.nameZh : vehicle.name}
                    </span>
                    {isLoading && (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isSelected && !isLoading && (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      
      {error && (
        <div className={`p-3 rounded text-xs ${
          isDark 
            ? 'bg-red-950/20 border border-red-900/50 text-red-400' 
            : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {error}
        </div>
      )}
    </div>
  );
};
