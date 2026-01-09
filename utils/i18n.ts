export type Language = 'en' | 'zh';

export const translations = {
  en: {
    // Header
    header: {
      title: 'Tesla Custom Wraps',
      poweredBy: 'Powered by DeepSeek AI'
    },
    // Main content
    main: {
      title: 'Create Your Design',
      description: 'Upload your vehicle template and define your vision. Our AI will generate a precision wrap design strictly adhering to your contours.',
      uploadTemplate: 'Upload Template',
      selectVehicleModel: 'Select Vehicle Model',
      orUploadTemplate: 'Upload Template',
      selectedVehicle: 'Selected Vehicle',
      failedToLoadTemplate: 'Failed to load template. Please try again or upload your own template.',
      configuration: 'Configuration',
      designTheme: 'Design Theme',
      designThemePlaceholder: 'e.g. Matte black with gloss stripes, cyberpunk aesthetic, minimal white logos...',
      designThemeHelp: 'Describe the texture, finish, graphics, and specific details.',
      selectVehicleTemplate: 'Select Vehicle Template',
      replaceImage: 'Replace Image',
      generateDesign: 'GENERATE DESIGN',
      processing: 'PROCESSING...',
      // Preview
      flat2D: '2D FLAT',
      model3D: '3D MODEL',
      save: 'Save',
      noSignal: 'NO SIGNAL',
      awaitingTemplate: 'Awaiting template input',
      loadDataToVisualize: 'Load data to visualize',
      aiGenerationPreview: 'AI Generation Preview',
      designedForProfessionalUse: 'Designed for Professional Use',
      interactive3DView: 'Interactive 3D View',
      synthesizing: 'Synthesizing',
      // Errors
      error: 'ERROR',
      pleaseUploadTemplate: 'Please upload a vehicle template first.',
      pleaseEnterPrompt: 'Please enter a design prompt.',
      failedToProcessImage: 'Failed to process image file.',
      somethingWentWrong: 'Something went wrong during generation.',
      // Auth
      signIn: 'Sign In',
      signOut: 'Sign Out',
      signInWithGoogle: 'Sign in with Google',
      // Theme
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode'
    }
  },
  zh: {
    // Header
    header: {
      title: 'Tesla Custom Wraps',
      poweredBy: '由 DeepSeek AI 驱动'
    },
    // Main content
    main: {
      title: '创建您的设计',
      description: '上传您的车辆模板并定义您的愿景。我们的AI将生成严格遵循轮廓的精密贴膜设计。',
      uploadTemplate: '上传模板',
      selectVehicleModel: '选择车型',
      orUploadTemplate: '上传模板',
      selectedVehicle: '已选择车型',
      failedToLoadTemplate: '加载模板失败。请重试或上传您自己的模板。',
      configuration: '配置',
      designTheme: '设计主题',
      designThemePlaceholder: '例如：哑光黑色配亮光条纹、赛博朋克美学、简约白色标志...',
      designThemeHelp: '描述纹理、饰面、图形和具体细节。',
      selectVehicleTemplate: '选择车辆模板',
      replaceImage: '替换图片',
      generateDesign: '生成设计',
      processing: '处理中...',
      // Preview
      flat2D: '2D 平面',
      model3D: '3D 模型',
      save: '保存',
      noSignal: '无信号',
      awaitingTemplate: '等待模板输入',
      loadDataToVisualize: '加载数据以可视化',
      aiGenerationPreview: 'AI 生成预览',
      designedForProfessionalUse: '专为专业用途设计',
      interactive3DView: '交互式 3D 视图',
      synthesizing: '合成中',
      // Errors
      error: '错误',
      pleaseUploadTemplate: '请先上传车辆模板。',
      pleaseEnterPrompt: '请输入设计提示词。',
      failedToProcessImage: '处理图片文件失败。',
      somethingWentWrong: '生成过程中出现错误。',
      // Auth
      signIn: '登录',
      signOut: '登出',
      signInWithGoogle: '使用 Google 登录',
      // Theme
      lightMode: '明亮模式',
      darkMode: '暗黑模式'
    }
  }
};

let currentLanguage: Language = (localStorage.getItem('language') as Language) || 'en';

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  window.dispatchEvent(new Event('languagechange'));
};

export const getLanguage = (): Language => {
  return currentLanguage;
};

export const t = (key: string): string => {
  const keys = key.split('.');
  let value: any = translations[currentLanguage];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};
