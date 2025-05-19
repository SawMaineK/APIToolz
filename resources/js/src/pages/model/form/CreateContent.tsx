import { MiscFaq, MiscHelp } from '@/partials/misc';

import { ModelContentProps } from '../_models';
import { Create } from './Create';
import { FormHighlight } from './FormHighlight';
import { Fragment } from 'react/jsx-runtime';
import { toAbsoluteUrl } from '@/utils';

const CreateContent = ({ model, onCreated }: ModelContentProps) => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Create model={model} onCreated={onCreated} />
      <FormHighlight
        image={
          <Fragment>
            <img
              src={toAbsoluteUrl('/media/illustrations/18.svg')}
              className="dark:hidden max-h-[200px]"
              alt="Illustration"
            />
            <img
              src={toAbsoluteUrl('/media/illustrations/18-dark.svg')}
              className="light:hidden max-h-[200px]"
              alt="Dark Illustration"
            />
          </Fragment>
        }
        title="Restyle Your Form:<br>AI Assistance at Your Fingertips"
        description="Effortlessly transform your forms with AI-powered suggestions and personalized configurations."
        more={{ title: 'Try it now!', url: `/apitoolz/model/${model.slug}/form` }}
        features={[
          ['Time-Saving', 'Easy Revamp'],
          ['Budget-Friendly', 'Fresh Look'],
          ['AI-Powered Suggestions', 'Personalized Configurations']
        ]}
      />
      <MiscFaq />

      <MiscHelp />
    </div>
  );
};

export { CreateContent };
