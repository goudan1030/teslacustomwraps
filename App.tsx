import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PromptInput } from './components/PromptInput';
import { Button } from './components/Button';
import { SEO } from './components/SEO';
import { VehicleSelector } from './components/VehicleSelector';
import { fileToBase64, base64ToDataUrl } from './utils/image';
import { generateWrapDesign } from './services/deepseekService';
import { AppState } from './types';
import { VehicleModel } from './types/vehicle';
import { ThreeDPreview } from './components/ThreeDPreview';
import { useTheme } from './contexts/ThemeContext';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import { trackEvent } from './utils/analytics';

// Icons - Refined for minimal look
const UploadIcon = () => {
  const { theme } = useTheme();
  return (
    <svg className={`w-8 h-8 mb-4 ${theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
};

const PhotoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CubeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

function App() {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  
  const [prompt, setPrompt] = useState('USA police car theme, high contrast black and white, sleek modern typography');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleModel | null>(null);
  const [uploadMode, setUploadMode] = useState<'select' | 'upload'>('select'); // 'select' for vehicle selection, 'upload' for file upload
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track page view on mount
  useEffect(() => {
    trackEvent('page_view', 'engagement', 'home');
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    trackEvent('file_upload', 'user_action', 'template_upload');

    try {
      const base64 = await fileToBase64(file);
      setOriginalImage(base64);
      setGeneratedImage(null);
      setState(AppState.IDLE);
      setErrorMsg(null);
      setSelectedVehicleId(null);
      setSelectedVehicle(null);
    } catch (e) {
      console.error(e);
      setErrorMsg(t('main.failedToProcessImage'));
      trackEvent('error', 'file_upload', 'failed_to_process');
    }
  };

  const handleVehicleSelect = (base64Image: string, vehicle: VehicleModel) => {
    setOriginalImage(base64Image);
    setGeneratedImage(null);
    setState(AppState.IDLE);
    setErrorMsg(null);
    setSelectedVehicleId(vehicle.id);
    setSelectedVehicle(vehicle);
    trackEvent('vehicle_select', 'user_action', vehicle.id);
  };

  const handleGenerate = async () => {
    if (!originalImage) {
      setErrorMsg(t('main.pleaseUploadTemplate'));
      return;
    }
    if (!prompt.trim()) {
      setErrorMsg(t('main.pleaseEnterPrompt'));
      return;
    }

    setState(AppState.GENERATING);
    setErrorMsg(null);
    setViewMode('2D');

    trackEvent('generate_design', 'user_action', 'design_generation_start');

    try {
      const base64Data = originalImage.includes('base64,') 
        ? originalImage.split('base64,')[1] 
        : originalImage;

      const resultUrl = await generateWrapDesign(base64Data, prompt);
      
      setGeneratedImage(resultUrl);
      setState(AppState.SUCCESS);
      trackEvent('generate_design_success', 'user_action', 'design_generation_complete');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || t('main.somethingWentWrong'));
      setState(AppState.ERROR);
      trackEvent('generate_design_error', 'error', err.message || 'unknown_error');
    }
  };

  const handleViewModeChange = (mode: '2D' | '3D') => {
    setViewMode(mode);
    trackEvent('view_mode_change', 'user_action', mode);
  };

  const isDark = theme === 'dark';

  return (
    <>
      <SEO 
        title="Tesla Custom Wraps - AI-Powered Vehicle Wrap Design | Professional Car Wrap Generator"
        description="Create stunning custom Tesla wraps with AI-powered design technology. Professional vehicle wrap designer with 2D and 3D preview. Design your dream Tesla wrap today."
        keywords="tesla custom wraps, tesla wrap design, car wrap designer, vehicle wrap, AI wrap design, custom car wrap, tesla wrap generator, professional wrap design, 3D wrap preview"
        url="https://teslacustomwraps.top/"
      />
      <div className={`min-h-screen flex flex-col ${isDark ? 'bg-black text-zinc-100' : 'bg-white text-zinc-900'} font-light transition-colors duration-300`}>
        <Header />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-[calc(100vh-20rem)] lg:h-[calc(100vh-18rem)]">
          
          {/* Left Column: Controls - Fixed alignment */}
          <div className="lg:col-span-4 flex flex-col overflow-y-auto">
            <div className="space-y-6 lg:space-y-8 flex-shrink-0 pr-2">
              <header className="space-y-6">
                <h1 className={`text-3xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
                  {t('main.title')}
                </h1>
                <p className={`font-light leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {t('main.description')}
                </p>
              </header>

              <hr className={isDark ? 'border-zinc-800' : 'border-zinc-300'} />
              
              {/* Step 1: Upload */}
              <section className="space-y-4" aria-labelledby="upload-section">
                <h2 id="upload-section" className={`text-sm font-semibold tracking-widest uppercase flex items-center gap-3 ${isDark ? 'text-white' : 'text-black'}`}>
                  <span className={`flex items-center justify-center w-5 h-5 rounded-full border ${isDark ? 'border-white' : 'border-black'} text-[10px]`} aria-hidden="true">1</span>
                  {t('main.uploadTemplate')}
                </h2>
                
                {/* Mode Toggle */}
                <div className={`flex gap-2 p-1 rounded-lg ${isDark ? 'bg-zinc-900/50' : 'bg-zinc-100'}`}>
                  <button
                    onClick={() => setUploadMode('select')}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors ${
                      uploadMode === 'select'
                        ? isDark
                          ? 'bg-zinc-700 text-white'
                          : 'bg-white text-black shadow-sm'
                        : isDark
                          ? 'text-zinc-400 hover:text-zinc-300'
                          : 'text-zinc-600 hover:text-zinc-800'
                    }`}
                  >
                    {t('main.selectVehicleModel')}
                  </button>
                  <button
                    onClick={() => setUploadMode('upload')}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors ${
                      uploadMode === 'upload'
                        ? isDark
                          ? 'bg-zinc-700 text-white'
                          : 'bg-white text-black shadow-sm'
                        : isDark
                          ? 'text-zinc-400 hover:text-zinc-300'
                          : 'text-zinc-600 hover:text-zinc-800'
                    }`}
                  >
                    {t('main.orUploadTemplate')}
                  </button>
                </div>

                {/* Vehicle Selector */}
                {uploadMode === 'select' && (
                  <div className={`max-h-[400px] overflow-y-auto ${isDark ? 'bg-zinc-900/30' : 'bg-zinc-50'} rounded border ${isDark ? 'border-zinc-800' : 'border-zinc-300'} p-4`}>
                    <VehicleSelector 
                      onVehicleSelect={handleVehicleSelect}
                      selectedVehicleId={selectedVehicleId}
                    />
                  </div>
                )}

                {/* File Upload */}
                {uploadMode === 'upload' && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`group relative border rounded p-8 text-center transition-all duration-300 cursor-pointer overflow-hidden ${
                      isDark 
                        ? 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-600 hover:bg-zinc-900/60' 
                        : 'border-zinc-300 bg-zinc-100/50 hover:border-zinc-400 hover:bg-zinc-200/60'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    
                  {originalImage ? (
                    <div className={`relative w-full rounded overflow-hidden flex items-center justify-center ${isDark ? 'bg-black' : 'bg-zinc-200'}`} style={{ minHeight: '200px', maxHeight: '400px' }}>
                        <img 
                          src={base64ToDataUrl(originalImage)} 
                          className="object-contain opacity-80 group-hover:opacity-100 transition-opacity p-2" 
                          alt="Tesla vehicle wrap template preview - Custom wrap design template"
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto'
                          }}
                        />
                        <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'bg-black/40' : 'bg-white/60'}`}>
                          <span className={`text-sm font-medium tracking-wide uppercase ${isDark ? 'text-white' : 'text-black'}`}>
                            {t('main.replaceImage')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-4">
                        <UploadIcon />
                        <p className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>
                          {t('main.selectVehicleTemplate')}
                        </p>
                        <p className={`text-xs mt-2 uppercase tracking-wide ${isDark ? 'text-zinc-600' : 'text-zinc-500'}`}>
                          PNG or JPG Max 5MB
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Vehicle Info */}
                {selectedVehicle && originalImage && (
                  <div className={`p-3 rounded border ${isDark ? 'bg-zinc-900/50 border-zinc-700' : 'bg-zinc-100 border-zinc-300'}`}>
                    <p className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {t('main.selectedVehicle')}: <span className={isDark ? 'text-white' : 'text-black'}>{(language === 'zh' ? selectedVehicle.nameZh : selectedVehicle.name)}</span>
                    </p>
                  </div>
                )}
              </section>

              {/* Step 2: Prompt */}
              <section className="space-y-4" aria-labelledby="configuration-section">
                <h2 id="configuration-section" className={`text-sm font-semibold tracking-widest uppercase flex items-center gap-3 ${isDark ? 'text-white' : 'text-black'}`}>
                  <span className={`flex items-center justify-center w-5 h-5 rounded-full border ${isDark ? 'border-white' : 'border-black'} text-[10px]`} aria-hidden="true">2</span>
                  {t('main.configuration')}
                </h2>
                <PromptInput 
                  value={prompt} 
                  onChange={setPrompt} 
                  disabled={state === AppState.GENERATING}
                />
                
                <div className="mt-8">
                  <Button 
                    onClick={handleGenerate}
                    className="w-full" 
                    isLoading={state === AppState.GENERATING}
                    disabled={!originalImage}
                    variant="primary"
                  >
                    {state === AppState.GENERATING ? t('main.processing') : t('main.generateDesign')}
                  </Button>
                  {errorMsg && (
                    <div className={`mt-4 p-4 rounded text-xs font-mono ${
                      isDark 
                        ? 'bg-red-950/20 border border-red-900/50 text-red-400' 
                        : 'bg-red-50 border border-red-200 text-red-600'
                    }`}>
                      {t('main.error')}: {errorMsg}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Right Column: Preview */}
          <aside className="lg:col-span-8 flex flex-col h-full max-h-full" aria-label="Design preview">
            <div className={`border rounded h-full overflow-hidden relative flex flex-col backdrop-blur-sm ${
              isDark 
                ? 'bg-zinc-900/20 border-zinc-800' 
                : 'bg-zinc-50/50 border-zinc-300'
            }`}>
              
              {/* Preview Header / Toolbar */}
              <div className={`h-14 border-b flex justify-between items-center px-6 ${
                isDark 
                  ? 'border-zinc-800 bg-black/50' 
                  : 'border-zinc-300 bg-white/80'
              }`}>
                <div className={`flex items-center gap-2 p-1 rounded-md ${
                  isDark ? 'bg-zinc-900/80' : 'bg-zinc-100/80'
                }`}>
                  <button 
                    onClick={() => handleViewModeChange('2D')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-medium tracking-wide transition-colors ${
                      viewMode === '2D' 
                        ? (isDark ? 'bg-zinc-700 text-white' : 'bg-zinc-300 text-black')
                        : (isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-600 hover:text-black')
                    }`}
                  >
                    <PhotoIcon /> {t('main.flat2D')}
                  </button>
                  <button 
                    onClick={() => handleViewModeChange('3D')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-medium tracking-wide transition-colors ${
                      viewMode === '3D' 
                        ? (isDark ? 'bg-zinc-700 text-white' : 'bg-zinc-300 text-black')
                        : (isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-600 hover:text-black')
                    }`}
                  >
                    <CubeIcon /> {t('main.model3D')}
                  </button>
                </div>

                {generatedImage && viewMode === '2D' && (
                  <a 
                    href={generatedImage} 
                    download="wrap-design.png"
                    className={`text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition-colors ${
                      isDark ? 'text-white hover:text-zinc-300' : 'text-black hover:text-zinc-600'
                    }`}
                    onClick={() => trackEvent('download_design', 'user_action', 'design_download')}
                  >
                    {t('main.save')} <DownloadIcon />
                  </a>
                )}
              </div>

              {/* Canvas Area */}
              <div className={`flex-1 flex items-center justify-center relative overflow-auto min-h-0 ${isDark ? 'bg-black' : 'bg-white'}`}>
                {/* Subtle grid for tech feel */}
                <div 
                  className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03]" 
                  style={{ 
                    backgroundImage: `linear-gradient(${isDark ? '#333' : '#ccc'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#333' : '#ccc'} 1px, transparent 1px)`, 
                    backgroundSize: '40px 40px' 
                  }}
                />

                {viewMode === '2D' ? (
                  <div className="w-full h-full flex items-center justify-center p-4 lg:p-8 z-10">
                    {!originalImage && !generatedImage && (
                      <div className={`text-center select-none ${isDark ? 'text-zinc-700' : 'text-zinc-400'}`}>
                        <h3 className="text-2xl font-thin tracking-wider mb-2">{t('main.noSignal')}</h3>
                        <p className="text-xs uppercase tracking-widest">{t('main.awaitingTemplate')}</p>
                      </div>
                    )}

                    {state === AppState.GENERATING && (
                      <div className={`absolute inset-0 z-20 backdrop-blur-sm flex flex-col items-center justify-center ${isDark ? 'bg-black/90' : 'bg-white/90'}`}>
                        <div className={`w-12 h-12 border-2 rounded-full animate-spin mb-6 ${
                          isDark ? 'border-zinc-800 border-t-white' : 'border-zinc-300 border-t-black'
                        }`}></div>
                        <p className={`text-sm tracking-[0.2em] animate-pulse uppercase ${isDark ? 'text-white' : 'text-black'}`}>
                          {t('main.synthesizing')}
                        </p>
                      </div>
                    )}

                    {generatedImage ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <img 
                          src={generatedImage} 
                          alt="AI-generated Tesla custom wrap design - Professional vehicle wrap with custom graphics and design" 
                          className={`object-contain shadow-2xl ${isDark ? 'shadow-black/80' : 'shadow-zinc-800/30'}`}
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto'
                          }}
                        />
                      </div>
                    ) : originalImage ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <img 
                          src={base64ToDataUrl(originalImage)} 
                          alt="Tesla vehicle wrap template - Base template for custom wrap design" 
                          className="object-contain opacity-40 grayscale blur-[0.5px]"
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto'
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  // 3D View Mode
                  <div className="w-full h-full relative z-10">
                    <ThreeDPreview textureUrl={generatedImage || (originalImage ? base64ToDataUrl(originalImage) : null)} />
                    {!generatedImage && !originalImage && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className={`backdrop-blur px-6 py-3 rounded border ${
                          isDark ? 'bg-black/80 border-zinc-800' : 'bg-white/80 border-zinc-300'
                        }`}>
                          <p className={`text-xs tracking-widest uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                            {t('main.loadDataToVisualize')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className={`mt-3 lg:mt-4 flex justify-between items-center text-[10px] uppercase tracking-widest ${
              isDark ? 'text-zinc-600' : 'text-zinc-500'
            }`}>
              <p>{t('main.aiGenerationPreview')}</p>
              <p className="hidden sm:inline">{t('main.designedForProfessionalUse')}</p>
            </div>
          </aside>
          
        </div>
      </main>
      
      <Footer />
    </div>
    </>
  );
}

export default App;
