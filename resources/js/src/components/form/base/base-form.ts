import { Subject, Observable } from 'rxjs';
import { v4 as uuid } from 'uuid';

type AsyncOptionsFn = (
  search: string,
  filter: { key: string; value: string },
  formGroup?: any
) => Observable<{ id: string; name: string }[]> | Promise<{ label: string; value: string }[]>;

export class BaseForm<T> {
  // Form Controls Properties
  unqKey: string | any;
  controlType: string;
  type: string;
  display: string;

  // Form Common Properties
  name: string | any;
  value: T | any;
  label: string;
  mask: string | [] | any;
  maskPlaceholder: string;
  placeholder: string;
  required: boolean;
  autoComplete: string;

  // Form Advance Properties
  config: any | {};
  component: any;

  // Form Additional Properties
  validators: any[];
  dateFormat: string | undefined;
  minDate: string | undefined;
  maxDate: string | undefined;
  acceptFiles: string;
  filePreview: boolean;
  tooltip: string;
  hint: string;
  readonly: boolean;
  prefix: string | any;
  endfix: string | any;
  prefixHtml: string | any;
  endfixHtml: string | any;
  group: string | any;
  order: number;
  min: number | any;
  max: number | any;
  passwordHash: string | boolean | undefined;
  hashLength: number;

  // Form Styling/Grids Properties
  style: any;
  inputClass: string;
  altClass: string;
  columns: string;
  dateView: string;

  // For Radio Button
  childs: BaseForm<string>[];

  // Form Independent Control
  criteriaValue: { key: string; value: string | boolean | any[] } | undefined;

  // Form Select 2
  multiple: boolean;
  options: { id: string; name: string }[] | any[];
  options$?: AsyncOptionsFn;
  filter: { parent: string; key: string } | any;
  valueChanges$?: Subject<any>;
  valueChangeEvent: (value: any, index: number, form: this, formGroup: any) => void | any;

  // Form Object Input
  formGroup: BaseForm<any>[] | any;

  // Form Array Input
  formArray: BaseForm<any>[];
  defaultLength: number;
  useTable: boolean | undefined;
  disableAddRow: boolean;
  addMoreText: string;
  rowDeleteEvent: (index: number) => void;

  // Table Header/Footer
  headerRows: number | undefined;
  headerWidths: any[] | undefined;
  tableHeader:
    | {
        label?: string;
        rowSpan?: number;
        colSpan?: number;
        style?: any;
        cellFn?: () => void;
        pipe?: string;
      }[][]
    | any;
  tableFooter:
    | {
        label?: string;
        rowSpan?: number;
        colSpan?: number;
        style?: any;
        cellFn?: () => void;
        pipe?: string;
      }[][]
    | any;

  // Form Callbacks
  formArrayCallback: (data: any) => void | any;
  onSubmitFormGroup: (values: any, form: this, formGroup?: any) => void | any;
  onResetFormGroup: (formGroup?: any) => void | any;
  submitted$?: Subject<boolean>;

  // Reactive Form Handler
  handler: any;

  constructor(
    options: {
      unqKey?: string;
      controlType?: string;
      type?: string;
      display?: string;

      name?: string;
      value?: T;
      label?: string;
      mask?: string | [] | any;
      maskPlaceholder?: string;
      placeholder?: string;
      required?: boolean;
      autoComplete?: string;

      config?: any;
      component?: any;

      validators?: any[];
      dateFormat?: string;
      minDate?: string;
      maxDate?: string;
      acceptFiles?: string;
      filePreview?: boolean;
      tooltip?: string;
      hint?: string;
      readonly?: boolean;
      prefix?: string;
      endfix?: string;
      prefixHtml?: string;
      endfixHtml?: string;
      group?: string;
      order?: number;
      min?: number;
      max?: number;
      passwordHash?: string | boolean;
      hashLength?: number;

      style?: any;
      inputClass?: string;
      altClass?: string;
      columns?: string;
      dateView?: string;

      childs?: BaseForm<string>[];

      criteriaValue?: { key: string; value: string | boolean | any[] };

      multiple?: boolean;
      options?: { id: string; name: string }[] | any[];
      options$?: AsyncOptionsFn;
      filter?: { parent: string; key: string } | any;
      valueChanges$?: Subject<any>;
      valueChangeEvent?: any;

      formGroup?: BaseForm<any>[] | any;

      formArray?: BaseForm<any>[];
      defaultLength?: number;
      useTable?: boolean;
      disableAddRow?: boolean;
      addMoreText?: string;
      rowDeleteEvent?: any;

      headerRows?: number;
      headerWidths?: any[];
      tableHeader?: {
        label?: string;
        rowSpan?: number;
        colSpan?: number;
        style?: any;
        cellFn?: () => void;
        pipe?: string;
      }[][];
      tableFooter?: {
        label?: string;
        rowSpan?: number;
        colSpan?: number;
        style?: any;
        cellFn?: () => void;
        pipe?: string;
      }[][];

      formArrayCallback?: any;
      onSubmitFormGroup?: any;
      onResetFormGroup?: any;
      submitted$?: Subject<boolean>;

      handler?: any;
    } = {}
  ) {
    this.unqKey = options.unqKey || uuid();
    this.controlType = options.controlType || 'textbox';
    this.type = options.type || 'text';
    this.display = options.display || 'flex flex-col gap-1';

    this.name = options.name;
    this.value = options.value;
    this.label = options.label || '';
    this.mask = options.mask;
    this.maskPlaceholder = options.maskPlaceholder || '-';
    this.placeholder = options.placeholder || '';
    this.required = options.required || false;
    this.autoComplete = options.autoComplete || 'off';

    this.config = options.config || {};
    this.component = options.component;

    this.validators = options.validators || [];
    this.dateFormat = options.dateFormat;
    this.minDate = options.minDate;
    this.maxDate = options.maxDate;
    this.acceptFiles = options.acceptFiles || '*';
    this.filePreview = options.filePreview || false;
    this.tooltip = options.tooltip || '';
    this.hint = options.hint || '';
    this.readonly = options.readonly || false;
    this.prefix = options.prefix;
    this.endfix = options.endfix;
    this.prefixHtml = options.prefixHtml;
    this.endfixHtml = options.endfixHtml;
    this.group = options.group;
    this.order = options.order || 1;
    this.min = options.min;
    this.max = options.max;
    this.passwordHash = options.passwordHash;
    this.hashLength = options.hashLength || 8;

    this.style = options.style || {};
    this.inputClass = options.inputClass || '';
    this.altClass = options.altClass || '';
    this.columns = options.columns || 'w-full';
    this.dateView = options.dateView || 'day';

    this.childs = options.childs || [];
    this.criteriaValue = options.criteriaValue;

    this.multiple = options.multiple || false;
    this.options = options.options || [];
    this.options$ = options.options$;
    this.filter = options.filter;
    this.valueChanges$ = options.valueChanges$;
    this.valueChangeEvent = options.valueChangeEvent;

    this.formGroup = options.formGroup || [];
    this.formArray = options.formArray || [];
    this.defaultLength = options.defaultLength || 1;
    this.useTable = options.useTable;
    this.disableAddRow = options.disableAddRow || false;
    this.addMoreText = options.addMoreText || 'Add more';
    this.rowDeleteEvent = options.rowDeleteEvent;

    this.headerRows = options.headerRows;
    this.headerWidths = options.headerWidths;
    this.tableHeader = options.tableHeader;
    this.tableFooter = options.tableFooter;

    this.formArrayCallback = options.formArrayCallback;
    this.onSubmitFormGroup = options.onSubmitFormGroup;
    this.onResetFormGroup = options.onResetFormGroup;
    this.submitted$ = options.submitted$;

    this.handler = options.handler;
  }
}
