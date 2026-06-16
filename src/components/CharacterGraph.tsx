import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

interface CharacterGraphProps {
  text: string;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  group: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string;
  target: string;
  label: string;
}

function parseText(text: string) {
  const nodes: { id: string; label: string; group: number }[] = [];
  const links: { source: string; target: string; label: string }[] = [];
  
  // Syntax 1: A -> B : Label or [A Name] -> [B Name] : Label
  const regex = /(?:\[([^\]]+)\]|([가-힣a-zA-Z0-9_]+))\s*(?:->|--|=>)\s*(?:\[([^\]]+)\]|([가-힣a-zA-Z0-9_]+))(?:\s*:\s*(.+))?/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const source = (match[1] || match[2]).trim();
    const target = (match[3] || match[4]).trim();
    const label = match[5] ? match[5].trim() : '';
    
    if (!nodes.find(n => n.id === source)) nodes.push({ id: source, label: source, group: 1 });
    if (!nodes.find(n => n.id === target)) nodes.push({ id: target, label: target, group: 2 });
    
    links.push({ source, target, label });
  }

  // Extracting names from "- 이름: 진우" patterns to also show nodes even without links
  const nameRegex = /-\s*이름\s*:\s*([가-힣a-zA-Z0-9]+)/g;
  while ((match = nameRegex.exec(text)) !== null) {
    const name = match[1].trim();
    if (name && !nodes.find(n => n.id === name)) {
      nodes.push({ id: name, label: name, group: 0 });
    }
  }

  return { nodes, links };
}

export function CharacterGraph({ text }: CharacterGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { nodes, links } = useMemo(() => parseText(text), [text]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Filter nodes and links to be standard d3 formats
    const graphNodes: GraphNode[] = nodes.map(d => Object.create(d));
    const graphLinks: GraphLink[] = links.map(d => Object.create(d));

    const simulation = d3.forceSimulation<GraphNode>(graphNodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(graphLinks).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(40));

    // Arrow markers
    svg.append('defs').selectAll('marker')
      .data(['end'])
      .enter().append('marker')
      .attr('id', String)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94a3b8');

    // Lines
    const link = svg.append('g')
      .selectAll('line')
      .data(graphLinks)
      .enter().append('line')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#end)');

    // Link labels
    const linkLabel = svg.append('g')
      .selectAll('text')
      .data(graphLinks)
      .enter().append('text')
      .attr('fill', '#64748b')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('text-anchor', 'middle')
      .text(d => d.label);

    // Node groups
    const node = svg.append('g')
      .selectAll('g')
      .data(graphNodes)
      .enter().append('g')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Node circles
    node.append('circle')
      .attr('r', 20)
      .attr('fill', d => d.group === 0 ? '#f1f5f9' : d.group === 1 ? '#e0e7ff' : '#ffe4e6')
      .attr('stroke', d => d.group === 0 ? '#cbd5e1' : d.group === 1 ? '#818cf8' : '#fb7185')
      .attr('stroke-width', 2);

    // Node texts
    node.append('text')
      .attr('dy', 4)
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle')
      .attr('fill', '#334155')
      .text(d => d.label);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any as GraphNode).x!)
        .attr('y1', d => (d.source as any as GraphNode).y!)
        .attr('x2', d => (d.target as any as GraphNode).x!)
        .attr('y2', d => (d.target as any as GraphNode).y!);

      linkLabel
        .attr('x', d => ((d.source as any as GraphNode).x! + (d.target as any as GraphNode).x!) / 2)
        .attr('y', d => ((d.source as any as GraphNode).y! + (d.target as any as GraphNode).y!) / 2 - 5);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  if (nodes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-slate-200">
        <p className="text-[13px] font-medium">관계도 데이터가 없습니다.</p>
        <p className="text-[12px] mt-1">입력창에 "A -&gt; B : 관계" 형식으로 작성하면 실시간 렌더링됩니다.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full relative border border-slate-200 rounded-xl overflow-hidden bg-[#fafafa]" ref={containerRef}>
      <svg ref={svgRef} className="w-full h-full" />
      <div className="absolute top-3 left-3 bg-white/80 p-2 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-500 shadow-sm">
        Drag to move nodes
      </div>
    </div>
  );
}
