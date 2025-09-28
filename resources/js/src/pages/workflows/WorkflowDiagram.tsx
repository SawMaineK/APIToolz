import React, { useMemo, useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  Position,
  MarkerType,
  NodeChange,
  applyNodeChanges,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { StopCircle } from 'lucide-react';

interface WorkflowStep {
  id: string;
  label: string;
  form?: any;
  conditions?: { when: string; next: string }[];
  finished?: boolean;
}

interface Workflow {
  name: string;
  steps: WorkflowStep[];
}

const nodeWidth = 180;
const nodeHeight = 60;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    if (!node.position || (node.position.x === 0 && node.position.y === 0)) {
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2
      };
    }
    node.draggable = true;
  });

  return { nodes, edges };
};

const getNodeStyle = (stepId: string, step: WorkflowStep) => {
  if (step.finished) {
    return {
      background: '#fef9c3',
      border: '3px dashed #ca8a04',
      borderRadius: 12,
      padding: 10,
      fontWeight: 'bold'
    };
  }
  if (step.form) {
    return {
      background: '#e0f2fe',
      border: '2px solid #0284c7',
      borderRadius: 8,
      padding: 10
    };
  }
  if (step.conditions) {
    return {
      background: '#fff7ed',
      border: '2px solid #f97316',
      borderRadius: 8,
      padding: 10
    };
  }
  if (stepId.includes('approve')) {
    return {
      background: '#dcfce7',
      border: '2px solid #16a34a',
      borderRadius: 8,
      padding: 10
    };
  }
  if (stepId.includes('reject')) {
    return {
      background: '#fee2e2',
      border: '2px solid #dc2626',
      borderRadius: 8,
      padding: 10
    };
  }
  return {
    background: '#f3f4f6',
    border: '2px solid #6b7280',
    borderRadius: 8,
    padding: 10
  };
};

const FinishedNode = ({ data }: any) => {
  const isRejected = data.label.toLowerCase().includes('reject');

  const nodeStyle = {
    background: isRejected ? '#fee2e2' : '#f3f4f6', // red-100 : yellow-100
    border: isRejected ? '2px solid #dc2626' : '2px solid #6b7280', // red-600 : yellow-600
    borderRadius: 12,
    padding: 10,
    fontWeight: 'bold',
    minWidth: 180,
    textAlign: 'center' as const,
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  };

  const iconColor = isRejected ? 'text-red-600' : 'text-gray-700';

  return (
    <div style={nodeStyle}>
      <div className="flex items-center justify-center gap-2">
        <StopCircle size={20} className={iconColor} />
        <span>{data.label}</span>
      </div>

      <Handle type="target" position={Position.Top} />
    </div>
  );
};

const nodeTypes = {
  finished: FinishedNode
};

const WorkflowDiagram: React.FC<{ workflow: Workflow }> = ({ workflow }) => {
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useMemo(() => {
    const rawNodes: Node[] = workflow.steps.map((step) => ({
      id: step.id,
      data: { label: step.label },
      position: { x: 0, y: 0 },
      style: step.finished ? {} : getNodeStyle(step.id, step),
      type: step.finished ? 'finished' : undefined
    }));

    const rawEdges: Edge[] = [];
    workflow.steps.forEach((step, idx) => {
      if (step.finished) return;

      if (!step.conditions && idx < workflow.steps.length - 1) {
        rawEdges.push({
          id: `${step.id}-${workflow.steps[idx + 1].id}`,
          source: step.id,
          target: workflow.steps[idx + 1].id,
          type: 'step',
          markerEnd: { type: MarkerType.ArrowClosed }
        });
      }
      if (step.conditions) {
        step.conditions.forEach((cond, cIdx) => {
          rawEdges.push({
            id: `${step.id}-cond-${cIdx}`,
            source: step.id,
            target: cond.next,
            type: 'step',
            markerEnd: { type: MarkerType.ArrowClosed },
            label: cond.when,
            animated: true,
            style: { stroke: '#f97316' },
            labelBgStyle: { fill: '#fff7ed', padding: 4, borderRadius: 4 },
            labelStyle: { fontSize: 12, fill: '#9a3412' }
          });
        });
      }
    });

    const layouted = getLayoutedElements(rawNodes, rawEdges, layoutDirection);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }, [workflow, layoutDirection]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <button
          className={`btn btn-sm ${layoutDirection === 'TB' ? 'btn-primary' : 'btn-light'}`}
          onClick={() => setLayoutDirection('TB')}
        >
          Vertical
        </button>
        <button
          className={`btn btn-sm ${layoutDirection === 'LR' ? 'btn-primary' : 'btn-light'}`}
          onClick={() => setLayoutDirection('LR')}
        >
          Horizontal
        </button>
      </div>

      <div style={{ width: '100%', height: 600 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          defaultEdgeOptions={{ type: 'step' }}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowDiagram;
