import { Node, Edge } from '@xyflow/react';

export const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'start',
    position: { x: 50, y: 200 },
    data: {
      label: 'Start',
      description: 'Beginning of workflow',
      status: 'idle'
    },
    deletable: false
  },
  {
    id: 'end',
    type: 'end',
    position: { x: 800, y: 200 },
    data: {
      label: 'End',
      description: 'End of workflow',
      status: 'idle'
    },
    deletable: false
  },
];

export const initialEdges: Edge[] = [];