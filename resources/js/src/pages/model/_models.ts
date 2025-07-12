import { BaseForm } from '@/components/form/base/base-form';

export interface FormField {
  class: string;
  field: string;
  alias: string;
  data_type: string;
  type: string;
  length: string;
  cast: string;
  label: string;
  validator: string;
  hidden: boolean;
  view: boolean;
  width: string;
  add: boolean;
  edit: boolean;
  search: boolean;
  size: string;
  sortlist: number;
  format_value: string;
  criteria: {
    key: string;
    value: string;
  };
  file: {
    image_multiple: boolean;
    save_full_path: boolean;
    path_to_upload: string;
    upload_type: string;
    upload_max_size: string;
  };
  option: {
    opt_type: string;
    lookup_model: string;
    lookup_table: string;
    lookup_key: string;
    lookup_value: string;
    lookup_dependency_key: string;
    lookup_filter_key: string;
    lookup_is_dependency_query: string;
    is_dependency: string;
    lookup_query: string;
    allow_filter_listing: string;
    typeahead: string;
    select_multiple: boolean;
    tooltip: string;
    helptext: string;
    placeholder: string;
    attribute: string;
    prefix: string;
    sufix: string;
  };
}

export interface GridField {
  class: string;
  field: string;
  alias: string;
  label: string;
  language: string[];
  search: boolean;
  download: boolean;
  align: string;
  view: boolean;
  detail: boolean;
  sortable: boolean;
  frozen: boolean;
  hidden: boolean;
  sortlist: number;
  width: string;
  conn: {
    valid: boolean;
    db: string;
    key: string;
    display: string;
    model: string;
  };
  format_as: string;
  format_value: string;
  only_roles: string[];
  link: string;
}

export interface Relationship {
  title: string;
  relation: string;
  master: string;
  master_key: string;
  model: string;
  table: string;
  key: string;
  display: string;
  allow_filter: boolean;
  concat: string;
  model_slug: string;
  sub: any;
}

export interface Filter {
  value: string;
  display: string;
  key: string;
  model: string;
  model_slug: string;
  query: string;
  title: string;
  type: string;
  position: number;
}

export interface ModelConfig {
  policy: boolean;
  softdelete: boolean;
  forms: FormField[];
  grid: GridField[];
  relationships: Relationship[];
  filters: Filter[];
  formLayout: BaseForm<string>[];
  reports: any[];
}

export interface Model {
  id: number;
  name: string;
  slug: string;
  title: string;
  desc: string;
  key: string;
  type: any;
  config: ModelConfig;
  table: string;
  auth: boolean;
  created_at: string;
}

export interface ModelContentProps {
  model: Model;
  modelData?: any;
  isModal?: boolean;
  page?: string;
  modal?: any;
  onCreated?: (data: any) => void;
}
