// CanvasBoard.tsx
import React, { useState, useEffect, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Table, Share2, PanelRightClose, SaveAll, Loader, Loader2 } from 'lucide-react';

const IconLabel = ({ icon, title, desc }: { icon: string; title: string; desc: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ backgroundColor: '#eef2ff', padding: 8, borderRadius: 8 }}>
        {makeIcon(icon || 'lightbulb')}
      </div>
      <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{title}</div>
    </div>
    <div style={{ fontSize: 13, color: '#374151' }}>{desc}</div>
  </div>
);

const nodeStyle = {
  padding: '1.25rem', // 20px
  borderRadius: '0.75rem', // 12px
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb', // Tailwind gray-200
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  textAlign: 'left' as React.CSSProperties['textAlign'],
  fontSize: 14,
  width: 280,
  maxWidth: '100%'
};

const initialNodes: Node[] = [];

const initialEdges: Edge[] = [];

import axios from 'axios';
import { PlanMaker } from '../model/PlanMaker';
import { FloatingToolbar } from './FloatingToolbar';
import SkeletonLoader from './SkeletonLoader';
import { useNavigate } from 'react-router';
import { makeIcon, PlanRequirement } from './PlanRequirement';
import { DataModelItem, MadePlan as plan } from '.';
import { PopupMessage } from './PopupMessage';
import { UserProcesses } from './UserProcesses';
import { DataModel } from './DataModel';
import { TechnologySection } from './TechnologySection';
import { TechnologyCard } from './TechnologyCard';
import { ProcessCard } from './ProcessCard';
import { Link } from 'react-router-dom';
import { DataTable } from './DataTable';
export const MadePlan = ({ id }: any) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const defaultEdgeOptions = {
    style: {
      stroke: '#cbd5e1',
      strokeWidth: 2,
      strokeDasharray: '0',
      transition: 'stroke 0.3s ease-in-out'
    },
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.Arrow,
      width: 6,
      height: 6,
      color: '#cbd5e1'
    }
  };

  const [loading, setLoading] = useState(true);
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [panelWidth, setPanelWidth] = useState(600);
  const [showMakerPlan, setShowMakerPlan] = useState(true);
  const [madePlan, setMadePlan] = useState<plan | undefined>(undefined);
  const [messages, setMessages] = useState([
    {
      id: 1,
      title: 'Requirements Agent',
      message: 'generated the User requirements section. How does it look?'
    },
    {
      id: 2,
      title: 'Process Agent',
      message: 'generated a set of processes next to the document. Does everything look ok?'
    },
    {
      id: 3,
      title: 'Data Agent',
      message: 'generated the Data model section. How does it look?'
    },
    {
      id: 4,
      title: 'Solution Agent',
      message: 'generated the Technology section. How does it look?'
    },
    {
      id: 5,
      message:
        "Now it's time to start creating objects. But before you do, you need to save the tables first."
    }
  ]);

  const generateNodesFromPlan = (madePlan: plan): Node[] => {
    const nodes: Node[] = [];

    // ✅ Business Problem Node
    nodes.push({
      id: 'business',
      data: {
        label: (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              alignItems: 'flex-center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                Business Problem
              </div>
            </div>
            <div className="w-full bg-gray-50 text-gray-900 text-sm px-4 py-3 rounded-lg border border-gray-200 shadow-sm">
              {madePlan?.problem || 'No problem defined'}
            </div>
          </div>
        )
      },
      position: { x: 600, y: 50 },
      style: { ...nodeStyle, width: '460px' }
    });

    // Base center for alignment
    let reqCenterX = 600 + 380 / 2;

    // ✅ Requirements Row
    if (Array.isArray(madePlan?.requirements)) {
      const reqCount = madePlan.requirements.length;
      const spacingX = 300;
      const nodeWidth = 280;
      const totalWidth = reqCount > 0 ? (reqCount - 1) * spacingX : 0;

      reqCenterX = 600 + 380 / 2;
      const startX = reqCenterX - totalWidth / 2 - nodeWidth / 2;

      madePlan.requirements.forEach((req: any, index: number) => {
        const posX = startX + index * spacingX;

        nodes.push({
          id: `req-${index}`,
          data: {
            label: <IconLabel icon={req.icon} title={req.role} desc={req.description} />
          },
          position: { x: posX, y: 300 },
          style: nodeStyle
        });
      });
    }

    // ✅ Technology Nodes Row (centered under requirements)
    if (Array.isArray(madePlan?.technology)) {
      const techCount = madePlan.technology.length;
      const techSpacingX = 400;
      const techNodeWidth = 380;
      const techTotalWidth = techCount > 0 ? (techCount - 1) * techSpacingX : 0;

      const techStartX = reqCenterX - techTotalWidth / 2 - techNodeWidth / 2;

      madePlan.technology.forEach((tech: any, index: number) => {
        const posX = techStartX + index * techSpacingX;

        nodes.push({
          id: `tech-${index}`,
          data: {
            label: (
              <TechnologyCard
                title={tech.component}
                subtitle={tech.type}
                description={tech.purpose}
                icon={tech.icon}
              />
            )
          },
          position: { x: posX, y: 500 },
          style: {
            ...nodeStyle,
            border: 'none',
            background: 'transparent',
            width: '380px',
            padding: '0px'
          }
        });
      });
    }

    // ✅ Process Nodes Row (centered under technology)
    if (Array.isArray(madePlan?.processes)) {
      const procCount = madePlan.processes.length;
      const procSpacingX = 400;
      const procNodeWidth = 380;
      const procTotalWidth = procCount > 0 ? (procCount - 1) * procSpacingX : 0;

      const procStartX = reqCenterX - procTotalWidth / 2 - procNodeWidth / 2;

      madePlan.processes.forEach((proc: any, index: number) => {
        const posX = procStartX + index * procSpacingX;

        nodes.push({
          id: `proc-${index}`,
          data: {
            label: (
              <ProcessCard title={proc.name} description={proc.description} steps={proc.steps} />
            )
          },
          position: { x: posX, y: 800 },
          style: {
            ...nodeStyle,
            border: 'none',
            background: 'transparent',
            width: '380px',
            padding: '0px'
          }
        });
      });
    }

    // ✅ Data Models Node
    if (Array.isArray(madePlan?.data_models)) {
      nodes.push({
        id: 'models',
        data: {
          label: (
            <div className="w-auto bg-white shadow rounded-md p-4 border h-fit">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold">Data model</h4>
                <div className="flex gap-3">
                  {madePlan?.raw_model_bash == null ? (
                    <div className="text-xs text-primary flex items-center gap-1 cursor-pointer">
                      <SaveAll size={14} /> Save tables
                    </div>
                  ) : (
                    <Link
                      to={'/admin/model/relationship'}
                      className="text-xs text-gray-500 flex items-center gap-1 cursor-pointer"
                    >
                      <Share2 size={14} /> Show details
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {madePlan.data_models.map((dm: DataModelItem, i: number) => (
                  <DataTable
                    key={i}
                    model={dm}
                    isCreate={(madePlan.raw_model_bash && !dm.has.model && !dm.has.table) || false}
                    onCreateModel={handleCreateModel}
                  />
                ))}
              </div>
            </div>
          )
        },
        position: { x: 600, y: 1400 },
        style: {
          ...nodeStyle,
          width: '460px',
          padding: '0px'
        }
      });
    }

    return nodes;
  };

  const generateEdgesFromPlan = (madePlan: any): Edge[] => {
    const edges: Edge[] = [];
    if (Array.isArray(madePlan?.requirements)) {
      madePlan.requirements.forEach((_: any, index: number) => {
        edges.push({
          id: `edge-business-req-${index}`,
          source: 'business',
          target: `req-${index}`,
          markerEnd: { type: MarkerType.ArrowClosed }
        });
      });
    }
    return edges;
  };

  useEffect(() => {
    if (madePlan) {
      const dynamicNodes = generateNodesFromPlan(madePlan);
      const dynamicEdges = generateEdgesFromPlan(madePlan);

      setNodes(dynamicNodes);
      setEdges(dynamicEdges);
    }
  }, [madePlan]);

  useEffect(() => {
    if (id) {
      fetchPlanContent('plan', '');
    }
    scrollToBottom();

    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(styleTag);
  }, []);

  const onConnect = (params: Connection) => setEdges((eds) => addEdge(params, eds));
  const fetchPlanContent = async (slug: string | undefined, question: string) => {
    if (!slug) return;
    try {
      const { data } = await axios.post<any>(
        `${import.meta.env.VITE_APP_API_URL}/model/${slug}/ask`,
        { question, id }
      );
      setMadePlan(data);
      if (id == undefined || id == null) {
        navigate(`/admin/plan/${data.id}`);
      }

      scrollToBottom();
      setLoading(false);
    } catch (error) {
      console.error('Error fetching model:', error);
    }
  };
  const handleSubmit = (text: string) => {
    setShowMakerPlan(false);
    setLoading(true);
    fetchPlanContent('plan', text);
  };

  const scrollToBottom = () => {
    if (contentRef.current) {
      setTimeout(() => {
        contentRef.current?.scrollTo({
          top: contentRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 0);
    }
  };

  const handleCreateModel = async (table: string) => {
    try {
      const { data } = await axios.post<any>(`${import.meta.env.VITE_APP_API_URL}/model/plan/ask`, {
        question: `${table}`,
        id
      });
      setMadePlan(data);
    } catch (error) {
      console.error('Error creating model:', error);
    }
  };

  if (id == null && showMakerPlan) {
    return <PlanMaker handleSubmit={handleSubmit} />;
  }
  return (
    <div style={{ display: 'flex', height: '90vh', width: '100%', marginTop: '-20px' }}>
      <div style={{ flexGrow: 1 }}>
        <ReactFlow
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          defaultEdgeOptions={defaultEdgeOptions}
          nodes={nodes}
          edges={edges}
          nodesDraggable={false}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
        >
          {/* <MiniMap /> */}
          <Controls />
          <Background gap={24} size={1.5} style={{ background: '#F5F5F5' }} />
          <FloatingToolbar onTogglePanel={() => setShowInfoPanel(!showInfoPanel)} />
        </ReactFlow>
        {showInfoPanel && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: showInfoPanel ? 0 : `-${panelWidth}px`,
              bottom: 0,
              width: `${panelWidth}px`,
              background: 'white',
              padding: '50px 20px',
              boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
              zIndex: 30,
              overflowY: 'auto',
              transition: 'right 0.3s ease-in-out'
            }}
          >
            {/* Resizer handle */}
            <div
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startWidth = panelWidth;

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const diff = startX - moveEvent.clientX;
                  setPanelWidth(Math.max(280, startWidth + diff)); // min width = 280px
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '6px',
                height: '100%',
                cursor: 'col-resize',
                background: 'transparent'
              }}
            />

            {/* Close button */}
            <button
              onClick={() => setShowInfoPanel(false)}
              className="absolute left-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <PanelRightClose size={20} strokeWidth={2} />
            </button>
            {loading && <SkeletonLoader />}
            {!loading && madePlan?.requirements && <PlanRequirement plan={madePlan} />}
            {!loading && madePlan?.processes && <UserProcesses plan={madePlan} />}
            {!loading && madePlan?.data_models && (
              <DataModel plan={madePlan} onCreateModel={handleCreateModel} />
            )}
            {!loading && madePlan?.technology && <TechnologySection plan={madePlan} />}
            <div
              style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                width: 'calc(100% - 40px)',
                maxWidth: panelWidth - 40 + 'px'
              }}
            >
              {madePlan?.processes == null &&
                madePlan?.requirements != null &&
                messages
                  .filter((msg) => msg.id === 1)
                  .map((msg) => (
                    <div key={msg.id} style={{ marginBottom: '12px' }}>
                      <PopupMessage
                        title={msg.title || ''}
                        message={msg.message}
                        onApprove={() => {
                          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
                          handleSubmit(`Generate processes for this plan`);
                        }}
                        onEdit={() => alert(`Edit clicked for: ${msg.id}`)}
                      />
                    </div>
                  ))}
              {madePlan?.data_models == null &&
                madePlan?.processes != null &&
                messages
                  .filter((msg) => msg.id === 2)
                  .map((msg) => (
                    <div key={msg.id} style={{ marginBottom: '12px' }}>
                      <PopupMessage
                        title={msg.title || ''}
                        message={msg.message}
                        onApprove={() => {
                          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
                          handleSubmit(`Generate data model for this plan`);
                        }}
                        onEdit={() => alert(`Edit clicked for: ${msg.id}`)}
                      />
                    </div>
                  ))}
              {madePlan?.technology == null &&
                madePlan?.data_models != null &&
                messages
                  .filter((msg) => msg.id === 3)
                  .map((msg) => (
                    <div key={msg.id} style={{ marginBottom: '12px' }}>
                      <PopupMessage
                        title={msg.title || ''}
                        message={msg.message}
                        onApprove={() => {
                          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
                          handleSubmit(`Generate technology for this plan`);
                        }}
                        onEdit={() => alert(`Edit clicked for: ${msg.id}`)}
                      />
                    </div>
                  ))}
              {madePlan?.technology != null &&
                madePlan.processes != null &&
                madePlan.processes[0].steps == null &&
                messages
                  .filter((msg) => msg.id === 4)
                  .map((msg) => (
                    <div key={msg.id} style={{ marginBottom: '12px' }}>
                      <PopupMessage
                        title={msg.title || ''}
                        message={msg.message}
                        onApprove={() => {
                          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
                          handleSubmit(`Generate process diagram for this plan`);
                        }}
                        onEdit={() => alert(`Edit clicked for: ${msg.id}`)}
                      />
                    </div>
                  ))}
              {madePlan?.technology != null &&
                madePlan.processes != null &&
                madePlan.processes[0].steps != null &&
                madePlan.raw_model_bash == null &&
                messages
                  .filter((msg) => msg.id === 5)
                  .map((msg) => (
                    <div key={msg.id} style={{ marginBottom: '12px' }}>
                      <PopupMessage
                        title={msg.title || ''}
                        message={msg.message}
                        onCreate={() => {
                          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
                          handleSubmit(`Generate models for this plan`);
                        }}
                      />
                    </div>
                  ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
