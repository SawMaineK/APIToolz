import { Observable, Subject } from 'rxjs';
export class BaseForm<T> {
  /**
   * Form Controls Properties
   */
  unqKey: string | any;
  controlType: string;
  type: string;
  display: string;

  /**
   * Form Common Properties
   */
  name: string | any;
  value: T | any;
  label: string;
  mask: string | [] | any;
  maskPlaceholder: string;
  placeholder: string;
  required: boolean;

  /**
   * Form Advance Properties
   */
  config: any | {};
  component: any;

  /**
   * Form Additional Properties
   */
  validators: any[];
  dateFormat: string | undefined;
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

  /**
   * Form Styling/Grids Properties
   */
  style: any;
  inputClass: string;
  altClass: string;
  columns: string;
  dateView: string; // Form Date Picker [date, month, year]

  /**
   * For Radio Button
   */
  childs: BaseForm<string>[];

  /**
   * Form Independent Control for (When it is?)
   */
  criteriaValue: { key: string; value: string | boolean | any[] } | undefined;

  /**
   * Form Select 2
   */
  multiple: boolean;
  options: { id: string; name: string }[] | any[];
  options$: (search: string, filter: {key: string, value: string}, formGroup: any) => void | any;
  filter: { parent: string; key: string } | any; //Filter dropdown when it is?
  valueChanges$: Subject<any> | undefined;
  valueChangeEvent: (value: any, index: number, form: this, formGroup: any) => void | any;

  /**
   * Form Object Input
   */
  formGroup: BaseForm<any>[] | any;

  /**
   * Form Array Input for List Objects
   */
  formArray: BaseForm<any>[];
  defaultLength: number; //Form Array Length
  useTable: boolean | undefined; // Form Table Style
  disableAddRow: boolean;
  addMoreText: string;
  rowDeleteEvent: (index: number) => void;

  /**
   * Form Table Header Style e.g colspan, rowspan
   */
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

  /**
   * Form Table Header Style e.g colspan, rowspan
   */
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

  /**
   * Getting Row Data of Form Array Callback
   */
  formArrayCallback: (data: any) => void | any;

  /**
   * Form Group Values Callback
   */
  onSubmitFormGroup: (values: any, form: this, formGroup?: any) => void | any;
  onResetFormGroup: (formGroup?: any) => void | any;
  submitted$: Subject<boolean> | undefined;
  /**
   * Form Reactive Form
   */
  handler: any;

  constructor(
    options: {
      /**
       * Form Controls Properties
       */
      unqKey?: string | any;
      controlType?: string;
      type?: string;
      display?: string;

      /**
       * Form Common Properties
       */
      name?: string | any;
      value?: T | any;
      label?: string;
      mask?: string | [] | any;
      maskPlaceholder?: string;
      placeholder?: string;
      required?: boolean;

      /**
       * Form Advance Properties
       */
      config?: any | {};
      component?: any;

      /**
       * Form Additional Properties
       */
      validators?: any[];
      dateFormat?: string | undefined;
      acceptFiles?: string;
      filePreview?: boolean;
      tooltip?: string;
      hint?: string;
      readonly?: boolean;
      prefix?: string | any;
      endfix?: string | any;
      prefixHtml?: string | any;
      endfixHtml?: string | any;
      group?: string | any;
      order?: number;
      min?: number | any;
      max?: number | any;

      /**
       * Form Styling/Grids Properties
       */
      style?: any;
      inputClass?: string;
      altClass?: string;
      columns?: string;
      dateView?: string; // Form Date Picker [date, month, year]

      /**
       * For Radio Button
       */
      childs?: BaseForm<string>[];

      /**
       * Form Independent Control for (When it is?)
       */
      criteriaValue?: { key: string; value: string | boolean | any[] } | undefined;

      /**
       * Form Select 2
       */
      multiple?: boolean;
      options?: { id: string; name: string }[] | any[];
      options$?: (search: string, filter: {key: string, value: string}, formGroup: any) => void | any;
      filter?: { parent: string; key: string } | any; //Filter dropdown when it is?
      valueChanges$?: Subject<any> | undefined;
      valueChangeEvent?: any;

      /**
       * Form Object Input
       */
      formGroup?: BaseForm<any>[] | any;

      /**
       * Form Array Input for List Objects
       */
      formArray?: BaseForm<any>[];
      defaultLength?: number; //Form Array Length
      useTable?: boolean | undefined; // Form Table Style
      disableAddRow?: boolean;
      addMoreText?: string;
      rowDeleteEvent?: any;

      /**
       * Form Table Header Style e.g colspan, rowspan
       */
      headerRows?: number | undefined;
      headerWidths?: any[] | undefined;
      tableHeader?:
        | {
            label?: string;
            rowSpan?: number;
            colSpan?: number;
            style?: any;
            cellFn?: () => void;
            pipe?: string;
          }[][]
        | any;

      /**
       * Form Table Header Style e.g colspan, rowspan
       */
      tableFooter?:
        | {
            label?: string;
            rowSpan?: number;
            colSpan?: number;
            style?: any;
            cellFn?: () => void;
            pipe?: string;
          }[][]
        | any;

      /**
       * Getting Row Data of Form Array Callback
       */
      formArrayCallback?: any;

      /**
       * Form Group Values Callback
       */
      onSubmitFormGroup?: any;
      onResetFormGroup?: any;
      submitted$?: Subject<boolean> | undefined;

      /**
       * Form Reactive Form
       */
      handler?: any;
    } = {}
  ) {
    /**
     * Form Controls Properties
     */
    this.unqKey = options.unqKey;
    this.controlType = options.controlType || 'textbox';
    this.type = options.type || 'text';
    this.display = options.display || 'x';

    /**
     * Form Common Properties
     */
    this.name = options.name;
    this.value = options.value;
    this.label = options.label || '';
    this.mask = options.mask;
    this.maskPlaceholder = options.maskPlaceholder || '-';
    this.placeholder = options.placeholder || '';
    this.required = options.required || false;

    /**
     * Form Advance Properties
     */
    this.config = options.config || {};
    this.component = options.component;

    /**
     * Form Additional Properties
     */
    this.validators = options.validators || [];
    this.dateFormat = options.dateFormat;
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
    this.order = options.order === undefined ? 1 : options.order;
    this.min = options.min;
    this.max = options.max;

    /**
     * Form Styling/Grids Properties
     */
    this.style = options.style || {};
    this.inputClass = options.inputClass || '';
    this.altClass = options.altClass || '';
    this.columns = options.columns || 'w-full';
    this.dateView = options.dateView || 'day';

    /**
     * For Radio Button
     */
    this.childs = options.childs || [];

    /**
     * Form Independent Control for (When it is?)
     */
    this.criteriaValue = options.criteriaValue;

    /**
     * Form Select 2
     */
    this.multiple = options.multiple || false;
    this.options = options.options || [];
    this.options$ = options.options$ || (() => {});
    this.filter = options.filter;
    this.valueChanges$ = options.valueChanges$;
    this.valueChangeEvent = options.valueChangeEvent;

    /**
     * Form Object Input
     */
    this.formGroup = options.formGroup || [];

    /**
     * Form Array Input for List Objects
     */
    this.formArray = options.formArray || [];
    this.defaultLength = options.defaultLength || 1;
    this.useTable = options.useTable;
    this.disableAddRow = options.disableAddRow || false;
    this.addMoreText = options.addMoreText || 'Add more';
    this.rowDeleteEvent = options.rowDeleteEvent;

    /**
     * Form Table Header Style e.g colspan, rowspan
     */
    this.headerRows = options.headerRows;
    this.headerWidths = options.headerWidths;
    this.tableHeader = options.tableHeader;

    /**
     * Form Table Header Style e.g colspan, rowspan
     */
    this.tableFooter = options.tableFooter;

    /**
     * Getting Row Data of Form Array Callback
     */
    this.formArrayCallback = options.formArrayCallback;

    /**
     * Form Group Values Callback
     */
    this.onSubmitFormGroup = options.onSubmitFormGroup;
    this.onResetFormGroup = options.onResetFormGroup;
    this.submitted$ = options.submitted$;

    /**
     * Form Reactive Form
     */
    this.handler = options.handler;
  }
}
