export interface VehicleModel {
  id: string;
  name: string;
  nameZh: string;
  githubPath: string; // 本地模板文件夹路径（与GitHub仓库结构保持一致）
  templateUrl: string; // 本地模板图片路径（相对于public目录）
  category: 'cybertruck' | 'model3' | 'modely';
  year?: string;
  variant?: 'base' | 'premium' | 'performance' | 'standard';
}

export const VEHICLE_MODELS: VehicleModel[] = [
  {
    id: 'cybertruck',
    name: 'Cybertruck',
    nameZh: 'Cybertruck',
    githubPath: 'cybertruck',
    templateUrl: '/templates/cybertruck/template.png',
    category: 'cybertruck'
  },
  {
    id: 'model3',
    name: 'Model 3',
    nameZh: 'Model 3',
    githubPath: 'model3',
    templateUrl: '/templates/model3/template.png',
    category: 'model3'
  },
  {
    id: 'model3-2024-base',
    name: 'Model 3 (2024+) Standard & Premium',
    nameZh: 'Model 3 (2024+) 标准版 & 高级版',
    githubPath: 'model3-2024-base',
    templateUrl: '/templates/model3-2024-base/template.png',
    category: 'model3',
    year: '2024',
    variant: 'base'
  },
  {
    id: 'model3-2024-performance',
    name: 'Model 3 (2024+) Performance',
    nameZh: 'Model 3 (2024+) 性能版',
    githubPath: 'model3-2024-performance',
    templateUrl: '/templates/model3-2024-performance/template.png',
    category: 'model3',
    year: '2024',
    variant: 'performance'
  },
  {
    id: 'modely',
    name: 'Model Y',
    nameZh: 'Model Y',
    githubPath: 'modely',
    templateUrl: '/templates/modely/template.png',
    category: 'modely'
  },
  {
    id: 'modely-2025-base',
    name: 'Model Y (2025+) Standard',
    nameZh: 'Model Y (2025+) 标准版',
    githubPath: 'modely-2025-base',
    templateUrl: '/templates/modely-2025-base/template.png',
    category: 'modely',
    year: '2025',
    variant: 'base'
  },
  {
    id: 'modely-2025-premium',
    name: 'Model Y (2025+) Premium',
    nameZh: 'Model Y (2025+) 高级版',
    githubPath: 'modely-2025-premium',
    templateUrl: '/templates/modely-2025-premium/template.png',
    category: 'modely',
    year: '2025',
    variant: 'premium'
  },
  {
    id: 'modely-2025-performance',
    name: 'Model Y (2025+) Performance',
    nameZh: 'Model Y (2025+) 性能版',
    githubPath: 'modely-2025-performance',
    templateUrl: '/templates/modely-2025-performance/template.png',
    category: 'modely',
    year: '2025',
    variant: 'performance'
  },
  {
    id: 'modely-l',
    name: 'Model Y L',
    nameZh: 'Model Y L',
    githubPath: 'modely-l',
    templateUrl: '/templates/modely-l/template.png',
    category: 'modely'
  }
];
