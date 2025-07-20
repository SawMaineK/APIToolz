import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import axios from 'axios';
import { toast } from 'sonner';

import { EntityNode } from './EntityNode';
import { RelationshipEdge } from './RelationshipEdge';
import { MoveHorizontal, MoveVertical } from 'lucide-react';
import { Model } from '../_models';

// ✅ Auto-layout settings
const nodeWidth = 260;
const nodeHeight = 250;

// ✅ Memoized edgeTypes & nodeTypes to avoid ReactFlow warnings
const edgeTypes = Object.freeze({ relationship: RelationshipEdge });
const nodeTypes = Object.freeze({ entityNode: EntityNode });

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const pos = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - nodeWidth / 2,
        y: pos.y - nodeHeight / 2
      }
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const Relationship = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // ✅ Load layout from localStorage if available
  useEffect(() => {
    const savedNodes = localStorage.getItem('relationship_nodes');
    const savedEdges = localStorage.getItem('relationship_edges');

    if (savedNodes && savedEdges) {
      try {
        setNodes(JSON.parse(savedNodes));
        setEdges(JSON.parse(savedEdges));
        return;
      } catch (err) {
        console.warn('Invalid saved layout, fetching fresh');
      }
    }

    fetchModels(); // fallback to fetch
  }, []);

  // ✅ Save layout after nodes move
  const handleNodeDragStop = useCallback(
    (_: any, updatedNode: Node) => {
      setNodes((prev) => {
        const newNodes = prev.map((n) => (n.id === updatedNode.id ? updatedNode : n));
        localStorage.setItem('relationship_nodes', JSON.stringify(newNodes));
        localStorage.setItem('relationship_edges', JSON.stringify(edges));
        return newNodes;
      });
    },
    [edges]
  );

  const fetchModels = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_APP_API_URL}/model?per_page=999`);

      const apiNodes: Node[] = data.data.map((model: Model) => {
        // ✅ SAFE array check
        const allFields = Array.isArray(model?.config?.forms)
          ? model.config.forms.map((f) => f.field)
          : [];

        let fields: string[] = [];
        if (allFields.length > 5) {
          fields = [...allFields.slice(0, 5), `+${allFields.length - 5} more`];
        } else if (allFields.length > 0) {
          fields = allFields;
        } else {
          fields = ['No fields'];
        }

        return {
          id: model.slug,
          type: 'entityNode',
          draggable: true, // ✅ make draggable
          data: {
            title: model.title || model.name,
            table: model.table,
            fields,
            allFields
          },
          position: { x: 0, y: 0 } // Will be positioned by dagre later
        };
      });

      const apiEdges: Edge[] = [];
      data.data.forEach((model: Model) => {
        const allFields = Array.isArray(model?.config?.forms)
          ? model.config.forms.map((f) => f.field)
          : [];
        const hiddenFields = allFields.length > 5 ? allFields.slice(5) : [];

        // ✅ SAFE check for relationships
        if (Array.isArray(model?.config?.relationships)) {
          model.config.relationships.forEach((rel, index) => {
            let leftLabel = '1';
            let rightLabel = '*';

            if (rel.relation === 'belongsTo') {
              leftLabel = '*';
              rightLabel = '1';
            } else if (rel.relation === 'hasMany') {
              leftLabel = '1';
              rightLabel = '*';
            }

            apiEdges.push({
              id: `edge-${model.slug}-${index}`,
              source: model.slug,
              target: rel.model_slug,
              type: 'relationship',
              markerEnd: { type: MarkerType.ArrowClosed, color: '#4e5867' },
              data: { leftLabel, rightLabel, hiddenFields },
              style: { stroke: '#4e5867', strokeWidth: 1.5 }
            });
          });
        }
      });

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        apiNodes,
        apiEdges,
        'LR'
      );

      // ✅ Keep draggable after layout
      const draggableNodes = layoutedNodes.map((n) => ({
        ...n,
        draggable: true
      }));

      setNodes(draggableNodes);
      setEdges(layoutedEdges);

      // ✅ Save initial layout to localStorage
      localStorage.setItem('relationship_nodes', JSON.stringify(draggableNodes));
      localStorage.setItem('relationship_edges', JSON.stringify(layoutedEdges));

      toast.success(`Loaded ${data.data.length} models`);
    } catch (error) {
      console.error(error);
      toast.error('Error fetching data');
    }
  };

  // ✅ Re-layout handler
  const handleRelayout = useCallback(
    (direction: 'TB' | 'LR') => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      const draggableNodes = layoutedNodes.map((n) => ({
        ...n,
        draggable: true
      }));

      setNodes(draggableNodes);
      setEdges(layoutedEdges);

      localStorage.setItem('relationship_nodes', JSON.stringify(draggableNodes));
      localStorage.setItem('relationship_edges', JSON.stringify(layoutedEdges));
    },
    [nodes, edges]
  );

  return (
    <div style={{ width: '100%', height: '90vh', position: 'relative', marginTop: '-20px' }}>
      {/* ✅ Layout Action Buttons */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
        <button
          onClick={() => handleRelayout('LR')}
          className="w-7 h-7 flex items-center justify-center mb-1 bg-white hover:bg-gray-100 rounded shadow transition-colors"
        >
          <MoveHorizontal className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={() => handleRelayout('TB')}
          className="w-7 h-7 flex items-center justify-center bg-white hover:bg-gray-100 rounded shadow transition-colors"
        >
          <MoveVertical className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      {/* ✅ ReactFlow Diagram */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        onNodeDragStop={handleNodeDragStop} // ✅ save after dragging
      >
        <Background gap={24} size={1.5} style={{ background: '#F5F5F5' }} />
        <Controls />
      </ReactFlow>
    </div>
  );
};
