import { toAbsoluteUrl } from '@/utils';
import React from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title?: string;
  description?: string;
  lightImage?: string;
  darkImage?: string;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  description = 'There is currently no data to display.',
  lightImage = '/media/illustrations/28.svg',
  darkImage = '/media/illustrations/28-dark.svg',
  buttonText = 'Get Started',
  buttonHref = '/',
  onButtonClick
}) => {
  return (
    <div>
      <div className="flex flex-col items-center gap-2.5 py-7.5">
        <div className="flex justify-center p-7.5 py-9">
          <img alt="image" className="dark:hidden max-h-[230px]" src={toAbsoluteUrl(lightImage)} />
          <img alt="image" className="light:hidden max-h-[230px]" src={toAbsoluteUrl(darkImage)} />
        </div>
        <div className="flex flex-col gap-5 lg:gap-7.5">
          <div className="flex flex-col gap-3 text-center">
            <h2 className="text-xl font-semibold text-mono">{title}</h2>
            <p
              className="text-sm text-foreground"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
          <div className="flex justify-center mb-5">
            {onButtonClick ? (
              <button className="btn btn-primary" onClick={onButtonClick}>
                {buttonText}
              </button>
            ) : (
              <Link className="btn btn-primary" to={buttonHref}>
                {buttonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
