export interface VehicleModel {
  id: string;
  name: string;
  nameZh: string;
  githubPath: string; // GitHub仓库中的路径
  templateUrl: string; // 模板图片URL
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
    templateUrl: 'https://raw.githubusercontent.com/teslamotors/custom-wraps/master/cybertruck/template.png',
    category: 'cybertruck'
  },
  {
    id: 'model3',
    name: 'Model 3',
    nameZh: 'Model 3',
    githubPath: 'model3',
    templateUrl: 'https://raw.githubusercontent.com/teslamotors/custom-wraps/master/model3/template.png',
    category: 'model3'
  },
  {
    id: 'model3-2024-base',
    name: 'Model 3 (2024+) Standard & Premium',
    nameZh: 'Model 3 (2024+) 标准版 & 高级版',
    githubPath: 'model3-2024-base',
    templateUrl: 'https://raw.githubusercontent.com/teslamotors/custom-wraps/master/model3-2024-base/template.png',
    category: 'model3',
    year: '2024',
    variant: 'base'
  },
  {
    id: 'model3-2024-performance',
    name: 'Model 3 (2024+) Performance',
    nameZh: 'Model 3 (2024+) 性能版',
    githubPath: 'model3-2024-performance',
    templateUrl: 'https://raw.githubusercontent.com/teslamotors/custom-wraps/master/model3-2024-performance/template.png',
    category: 'model3',
    year: '2024',
    variant: 'performance'
  },
  {
    id: 'modely',
    name: 'Model Y',
    nameZh: 'Model Y',
    githubPath: 'modely',
    templateUrl: 'https://raw.githubusercontent.com/teslamotors/custom-wraps/master/modely/template.png',
    category: 'modely'
  },
  {
    id: 'modely-2025-base',
    name: 'Model Y (2025+) Standard',
    nameZh: 'Model Y (2025+) 标准版',
    githubPath: 'modely-2025-base',
    templateUrl: 'https://raw.githubusercontent.com/teslamotors/custom-wraps/master/modely-2025-base/template.png',
    category: 'modely',
    year: '2025',
    variant: 'base'
  },
  {
    id: 'modely-2025-premium',
    name: 'Model Y (2025+) Premium',
    nameZh: 'Model Y (2025+) 高级版',
    githubPath: 'modely-2025-premium',
    templateUrl: 'https://raw.githubusercontent.com/teslamotors/custom-wraps/master/modely-2025-premium/template.png',
    category: 'modely',
    year: '2025',
    variant: 'premium'
  },
  {
    id: 'modely-2025-performance',
    name: 'Model Y (2025+) Performance',
    nameZh: 'Model Y (2025+) 性能版',
    githubPath: 'modely-2025-performance',
    templateUrl: 'https://raw.githubusercontent.com/teslamotors/custom-wraps/master/modely-2025-performance/template.png',
    category: 'modely',
    year: '2025',
    variant: 'performance'
  },
  {
    id: 'modely-l',
    name: 'Model Y L',
    nameZh: 'Model Y L',
    githubPath: 'modely-l',
    templateUrl: 'https://raw.githubusercontent.com/teslamotors/custom-wraps/master/modely-l/template.png',
    category: 'modely'
  }
];
