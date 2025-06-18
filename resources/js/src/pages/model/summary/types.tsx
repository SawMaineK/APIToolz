export type SummaryWidgetProps = {
  widget: {
    type: string;
    title: string;
    value?: number;
    icon?: string;
    max?: number;
    unit?: string;
    labels?: string[];
    data?: number[];
    chartType?: 'bar' | 'line' | 'pie' | 'donut';
    height: number;
    colors: string[];
  };
};
