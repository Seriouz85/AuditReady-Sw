import React from 'react';
import { Node, Edge } from 'reactflow';

export interface Template {
  id: string;
  name: string;
  description: string;
  category?: string;
  icon?: React.ReactNode;
  nodes: Node[];
  edges: Edge[];
} 