import { create } from 'zustand'
import { Node, Edge } from 'reactflow'

export interface LayerConfig {
  [key: string]: number | string | boolean | number[]
}

export interface LayerNode {
  id: string
  type: string
  label: string
  config: LayerConfig
}

interface BuilderState {
  nodes: Node[]
  edges: Edge[]
  selectedNodeId: string | null
  history: { nodes: Node[]; edges: Edge[] }[]
  historyStep: number
  layerCounter: number

  // Actions
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  addNode: (node: Node) => void
  deleteNode: (id: string) => void
  updateNode: (id: string, data: Record<string, any>) => void
  addEdge: (edge: Edge) => void
  deleteEdge: (id: string) => void
  selectNode: (id: string | null) => void
  getSelectedNode: () => Node | undefined
  getSelectedNodeData: () => Record<string, any> | undefined
  pushHistory: () => void
  undo: () => void
  redo: () => void
  reset: () => void
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  history: [],
  historyStep: -1,
  layerCounter: 0,

  setNodes: (nodes: Node[]) => {
    set((state: BuilderState) => ({
      ...state,
      nodes,
    }))
  },

  setEdges: (edges: Edge[]) => {
    set((state: BuilderState) => ({
      ...state,
      edges,
    }))
  },

  addNode: (node: Node) => {
    set((state: BuilderState) => ({
      ...state,
      nodes: [...state.nodes, node],
      layerCounter: state.layerCounter + 1,
    }))
  },

  deleteNode: (id: string) => {
    set((state: BuilderState) => {
      const newNodes = state.nodes.filter((n: Node) => n.id !== id)
      const newEdges = state.edges.filter(
        (e: Edge) => e.source !== id && e.target !== id
      )
      const newSelectedId = state.selectedNodeId === id ? null : state.selectedNodeId
      return {
        ...state,
        nodes: newNodes,
        edges: newEdges,
        selectedNodeId: newSelectedId,
      }
    })
  },

  updateNode: (id: string, data: Record<string, any>) => {
    set((state: BuilderState) => {
      const newNodes = state.nodes.map((n: Node) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      )
      return {
        ...state,
        nodes: newNodes,
      }
    })
  },

  addEdge: (edge: Edge) => {
    set((state: BuilderState) => {
      const exists = state.edges.find(
        (e: Edge) => e.source === edge.source && e.target === edge.target
      )
      if (exists) return state
      return {
        ...state,
        edges: [...state.edges, edge],
      }
    })
  },

  deleteEdge: (id: string) => {
    set((state: BuilderState) => {
      const newEdges = state.edges.filter((e: Edge) => e.id !== id)
      return {
        ...state,
        edges: newEdges,
      }
    })
  },

  selectNode: (id: string | null) => {
    set((state: BuilderState) => ({
      ...state,
      selectedNodeId: id,
    }))
  },

  getSelectedNode: () => {
    const state = get()
    return state.nodes.find((n: Node) => n.id === state.selectedNodeId)
  },

  getSelectedNodeData: () => {
    const node = get().getSelectedNode()
    return node?.data
  },

  pushHistory: () => {
    set((state: BuilderState) => {
      const newHistory = state.history.slice(0, state.historyStep + 1)
      newHistory.push({
        nodes: JSON.parse(JSON.stringify(state.nodes)),
        edges: JSON.parse(JSON.stringify(state.edges)),
      })
      return {
        ...state,
        history: newHistory,
        historyStep: newHistory.length - 1,
      }
    })
  },

  undo: () => {
    set((state: BuilderState) => {
      if (state.historyStep > 0) {
        const newStep = state.historyStep - 1
        const { nodes, edges } = state.history[newStep]
        return {
          ...state,
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
          historyStep: newStep,
          selectedNodeId: null,
        }
      }
      return state
    })
  },

  redo: () => {
    set((state: BuilderState) => {
      if (state.historyStep < state.history.length - 1) {
        const newStep = state.historyStep + 1
        const { nodes, edges } = state.history[newStep]
        return {
          ...state,
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
          historyStep: newStep,
          selectedNodeId: null,
        }
      }
      return state
    })
  },

  reset: () => {
    set((): BuilderState => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      history: [],
      historyStep: -1,
      layerCounter: 0,
      setNodes: () => {},
      setEdges: () => {},
      addNode: () => {},
      deleteNode: () => {},
      updateNode: () => {},
      addEdge: () => {},
      deleteEdge: () => {},
      selectNode: () => {},
      getSelectedNode: () => undefined,
      getSelectedNodeData: () => undefined,
      pushHistory: () => {},
      undo: () => {},
      redo: () => {},
      reset: () => {},
    }))
  },
}))
