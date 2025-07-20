export interface RequirementItem {
  icon: string;
  role: string;
  description: string;
  needs: string[];
}

export interface ProcessItem {
  name: string;
  icon: string;
  description: string;
  steps: any[];
}

export interface DataModelItem {
  table_name: string;
  description: string;
}

export interface TechnologyItem {
  icon: string;
  component: string;
  type: string;
  purpose: string;
}

// Main MadePlan interface
export interface MadePlan {
  id: number;
  short_code: string;
  name: string;
  problem: string;
  purpose: string;
  requirements: RequirementItem[];
  processes: ProcessItem[];
  data_models: DataModelItem[];
  technology: TechnologyItem[];
  raw_plan_json: string | null;
  raw_model_bash: string | null;
  status: string | null;
  owner: string | null;
  created_at: string;
  updated_at: string;
}
