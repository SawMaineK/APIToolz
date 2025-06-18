import React from 'react';
import ApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import * as LucideIcons from 'lucide-react';
import { SummaryWidgetProps } from './types';
import { toAbsoluteUrl } from '@/utils';

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
        <>
          <style>
            {`
                .channel-stats-bg {
                    background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-3.png')}');
                }
                .dark .channel-stats-bg {
                    background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-3-dark.png')}');
                }
            `}
          </style>
          <div className="card flex-col justify-between gap-6 px-4 w-full bg-cover rtl:bg-[left_top_-1.7rem] bg-[right_top_-1.7rem] bg-no-repeat channel-stats-bg">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1 pb-4 px-0 py-5">
                <span className="text-2sm font-bold text-gray-700">{widget.title}</span>
                <p className="text-3xl font-semibold text-gray-900 mt-4">{widget.value}</p>
              </div>
              {Icon && <Icon className="w-8 h-8 text-primary" />}
            </div>
          </div>
        </>
      );

    case 'chart': {
      const isPie = widget.chartType === 'pie' || widget.chartType === 'donut';

      const chartData = isPie
        ? {
            labels: widget.labels,
            series: widget.data ?? []
          }
        : {
            labels: widget.labels,
            series: [
              {
                name: widget.title,
                data: widget.data ?? []
              }
            ]
          };

      const options: ApexOptions = {
        chart: {
          type: widget.chartType,
          height: 250,
          toolbar: {
            show: false
          }
        },
        ...(isPie
          ? {
              labels: widget.labels,
              legend: {
                position: 'bottom'
              }
            }
          : {
              stroke: {
                curve: 'smooth',
                width: 2
              },
              xaxis: {
                categories: widget.labels,
                labels: {
                  style: {
                    colors: 'var(--tw-gray-500)',
                    fontSize: '12px'
                  }
                }
              },
              yaxis: {
                labels: {
                  style: {
                    colors: 'var(--tw-gray-500)',
                    fontSize: '12px'
                  }
                }
              },
              grid: {
                borderColor: 'var(--tw-gray-200)',
                strokeDashArray: 5
              }
            }),
        tooltip: {
          theme: 'light'
        },
        fill: {
          opacity: 0.8
        }
      };

      return (
        <div className="card h-full">
          <div className="card-header">
            <h3 className="card-title">{widget.title}</h3>
          </div>
          <div className="card-body flex flex-col justify-end items-stretch grow px-3 py-1">
            <ApexChart
              id="earnings_chart"
              options={options}
              series={chartData.series}
              type={widget.chartType}
              max-width="694"
              height="360"
            />
          </div>
        </div>
      );
    }

    case 'progress': {
      const percentage = ((widget.value ?? 0) / (widget.max ?? 1)) * 100;

      return (
        <div className="bg-white shadow rounded-xl p-4 w-full">
          <h4 className="text-2sm font-bold text-gray-700">{widget.title}</h4>
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
