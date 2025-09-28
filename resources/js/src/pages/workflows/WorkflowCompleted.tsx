import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import successAnimation from './../../lottie/successful.json';

interface Props {
  workflowName: string;
  startWorkflow: () => void;
}

const WorkflowCompleted: React.FC<Props> = ({ workflowName, startWorkflow }) => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, [workflowName]);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white border rounded-xl shadow-lg text-center">
      <div className="flex justify-center">
        <div className="w-100 h-100">
          <Lottie
            key={animationKey}
            animationData={successAnimation}
            loop={false}
            style={{ color: 'rgb(22, 163, 74)' }}
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold">Workflow Completed</h2>
      <p className="mt-2 text-gray-600">All steps for "{workflowName}" are done successfully.</p>

      <div className="my-4">
        <button onClick={startWorkflow} className="px-4 py-2 bg-primary text-white rounded-md">
          Start New Workflow
        </button>
      </div>
    </div>
  );
};

export default WorkflowCompleted;
