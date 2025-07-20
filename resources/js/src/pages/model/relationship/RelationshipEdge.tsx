import React from 'react';
import { BaseEdge, getSmoothStepPath, EdgeProps } from 'reactflow';

export const RelationshipEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  data
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const leftLabel = data?.leftLabel || '1';
  const rightLabel = data?.rightLabel || '*';

  return (
    <>
      {/* ✅ Draw the edge line */}
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />

      {/* ✅ Simple Left Label */}
      <foreignObject
        x={labelX - 20}
        y={labelY - 12}
        width={20}
        height={20}
        style={{ overflow: 'visible' }}
      >
        <div className="text-xs bg-white rounded-full border px-1 text-gray-600 shadow-sm">
          {leftLabel}
        </div>
      </foreignObject>

      {/* ✅ Simple Right Label */}
      <foreignObject
        x={labelX + 5}
        y={labelY - 12}
        width={20}
        height={20}
        style={{ overflow: 'visible' }}
      >
        <div className="text-xs bg-white rounded-full border px-1 text-gray-600 shadow-sm">
          {rightLabel}
        </div>
      </foreignObject>
    </>
  );
};
