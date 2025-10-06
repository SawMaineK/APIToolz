import React, { useMemo, useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Workflow, WorkflowStep } from './types';
import { getLayoutedElements } from './utils';
import { Inspector } from './Inspector';

export const WorkflowBuilder: React.FC<{
  workflow: Workflow;
  onWorkflowChange?: (wf: Workflow) => void;
}> = ({ workflow, onWorkflowChange }) => {
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow>(workflow);
  const [openPropertiesPanel, setOpenPropertiesPanel] = useState(false);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);

  // keep in sync if parent workflow changes
  useEffect(() => {
    setCurrentWorkflow(workflow);
  }, [workflow]);

  // generate initial layout
  const initial = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    currentWorkflow.steps.forEach((step) => {
      nodes.push({
        id: step.id,
        data: { ...step },
        position: { x: 0, y: 0 },
        style: {
          border: '1px solid #333',
          borderRadius: 6,
          padding: 6,
          background: step.finished ? '#fde2e2' : '#e6f7ff'
        }
      });

      step.conditions?.forEach((cond) => {
        edges.push({
          id: `${step.id}-${cond.next}`,
          source: step.id,
          target: cond.next,
          label: cond.when,
          animated: true
        });
      });
    });

    return getLayoutedElements(nodes, edges);
  }, [currentWorkflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  const relayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onNodeClick = (_: any, node: Node<WorkflowStep>) => {
    setSelectedStep(node.data);
    setOpenPropertiesPanel(true);
  };

  const sanitizeStep = (step: WorkflowStep): any => {
    const cleaned: any = {
      id: step.id,
      label: step.label
    };

    if (step.roles && step.roles.length > 0) {
      cleaned.roles = step.roles;
    }

    if (step.conditions && step.conditions.length > 0) {
      cleaned.conditions = step.conditions;
    }

    if (step.form?.fields && step.form.fields.length > 0) {
      cleaned.form = { fields: step.form.fields };
    }

    if (step.create_model && Object.keys(step.create_model).length > 0) {
      cleaned.create_model = step.create_model;
    }

    if (step.update_models && step.update_models.length > 0) {
      cleaned.update_models = step.update_models;
    }

    if (step.finished) {
      cleaned.finished = step.finished;
    }

    return cleaned;
  };

  // ✅ update nodes + local workflow + notify parent + re-layout + refresh edges
  const onSave = (updated: WorkflowStep) => {
    const cleanedStep = sanitizeStep(updated);

    const newSteps = currentWorkflow.steps.map((s) =>
      s.id === updated.id ? cleanedStep : sanitizeStep(s)
    );
    const newWorkflow = { ...currentWorkflow, steps: newSteps };

    const updatedNodes: Node[] = newSteps.map((step) => ({
      id: step.id,
      data: { ...step },
      position: { x: 0, y: 0 },
      style: {
        border: '1px solid #333',
        borderRadius: 6,
        padding: 6,
        background: step.finished ? '#fde2e2' : '#e6f7ff'
      }
    }));

    const updatedEdges: Edge[] = [];
    newSteps.forEach((step) => {
      step.conditions?.forEach((cond: any) => {
        updatedEdges.push({
          id: `${step.id}-${cond.next}`,
          source: step.id,
          target: cond.next,
          label: cond.when,
          animated: true
        });
      });
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      updatedNodes,
      updatedEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    setCurrentWorkflow(newWorkflow);
    onWorkflowChange?.(newWorkflow);

    setSelectedStep(null);
    setOpenPropertiesPanel(false);
  };

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;
    addStep(type);
  }, []);

  const addStep = (type: string = 'step') => {
    const id = `${type}_${+new Date()}`;

    const newStep: WorkflowStep = {
      id,
      label: `New ${type.toUpperCase()}`,
      roles: [],
      form: {
        fields: []
      },
      create_model: {},
      update_models: [],
      conditions: [],
      finished: false
    };

    const newWorkflow = {
      ...currentWorkflow,
      steps: [...currentWorkflow.steps, newStep]
    };

    const newNode: Node = {
      id,
      position: { x: 0, y: 0 },
      data: newStep,
      style: {
        border: '1px solid #555',
        borderRadius: 6,
        padding: 6,
        background: '#fff7e6'
      }
    };

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      [...nodes, newNode],
      edges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setCurrentWorkflow(newWorkflow);
    onWorkflowChange?.(newWorkflow);
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 relative">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            <Background />
            <MiniMap />
            <Controls />
          </ReactFlow>

          {/* Buttons */}
          <div className="absolute top-2 left-2 flex gap-2">
            <button onClick={() => addStep('step')} className="btn btn-light btn-sm">
              + New Step
            </button>
            <button onClick={relayout} className="btn btn-light btn-sm">
              Re-layout
            </button>
          </div>
        </ReactFlowProvider>
      </div>

      {/* Inspector side panel */}
      <Inspector
        open={openPropertiesPanel}
        onClose={() => setOpenPropertiesPanel(false)}
        workflow={currentWorkflow}
        selected={selectedStep}
        setSelected={setSelectedStep}
        onSave={onSave}
      />
    </div>
  );
};
