import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import * as LucideIcons from 'lucide-react';
import { SummaryWidgetProps } from './types';

function toPascalCase(str: string): string {
  return str
    .replace(/[-_](.)/g, (_, group1) => group1.toUpperCase()) // convert kebab to camel
    .replace(/^(.)/, (_, group1) => group1.toUpperCase()); // capitalize first
}

export const SummaryWidgetCard: React.FC<SummaryWidgetProps> = ({ widget }) => {
  const IconName = widget.icon ? toPascalCase(widget.icon) : null;
  const Icon = IconName && (LucideIcons as any)[IconName];

  switch (widget.type) {
    case 'kpi':
      return (
        <div className="bg-white shadow rounded-xl p-4 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm text-gray-500">{widget.title}</h4>
              <p className="text-2xl font-semibold text-gray-800 mt-4">{widget.value}</p>
            </div>
            {Icon && <Icon className="w-8 h-8 text-primary" />}
          </div>
        </div>
      );

    case 'chart': {
      const chartData = {
        labels: widget.labels,
        datasets: [
          {
            label: widget.title,
            data: widget.data,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }
        ]
      };
      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false
      };

      return (
        <div className="bg-white shadow rounded-xl p-4 w-full h-64">
          <h4 className="text-sm text-gray-500 mb-2">{widget.title}</h4>
          {widget.chartType === 'line' ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      );
    }

    case 'progress': {
      const percentage = ((widget.value ?? 0) / (widget.max ?? 1)) * 100;

      return (
        <div className="bg-white shadow rounded-xl p-4 w-full">
          <h4 className="text-sm text-gray-500">{widget.title}</h4>
          <div className="text-lg font-semibold text-gray-800">
            {widget.value} / {widget.max} {widget.unit}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};
