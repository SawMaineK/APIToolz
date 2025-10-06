import dagre from "dagre";
import { Node, Edge, Position } from "reactflow";
import { Workflow } from "./types";

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const nodeWidth = 220;
const nodeHeight = 80;

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
) => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
};

// Normalize YAML workflow -> UI model
export function normalizeWorkflow(yamlWorkflow: any): Workflow {
  return {
    name: yamlWorkflow.name,
    steps: yamlWorkflow.steps.map((step: any) => ({
      ...step,
      // 👇 flatten "form.fields" into just "form"
      form: step.form?.fields ? step.form.fields : step.form || [],
    })),
  };
}
