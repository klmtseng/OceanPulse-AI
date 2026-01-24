import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { OceanCurrent } from '../types';
import { MOCK_GEO_JSON_URL } from '../constants';

interface Props {
  selectedCurrent: OceanCurrent | null;
  onSelectCurrent: (current: OceanCurrent) => void;
  currents: OceanCurrent[];
}

const GlobeVisualization: React.FC<Props> = ({ selectedCurrent, onSelectCurrent, currents }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 });
  
  // Rotation state
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  
  // Interaction Refs
  const isDragging = useRef(false);
  const lastPos = useRef<[number, number] | null>(null);
  const autoRotateTimer = useRef<d3.Timer | null>(null);
  const userInteracted = useRef(false); // Track if user has manually moved the globe

  // Load GeoJSON
  useEffect(() => {
    fetch(MOCK_GEO_JSON_URL)
      .then(res => res.json())
      .then(data => {
        setGeoData(feature(data, data.objects.countries));
      });

    const handleResize = () => {
      if (wrapperRef.current) {
        const { clientWidth, clientHeight } = wrapperRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Logic: Auto-rotate VS Focus VS Manual Drag
  useEffect(() => {
    // Stop any existing timer first
    if (autoRotateTimer.current) {
        autoRotateTimer.current.stop();
        autoRotateTimer.current = null;
    }

    // If user is dragging, do nothing (let mouse handlers manage rotation)
    if (isDragging.current) return;

    // If a current is selected, animate focus to it (unless user just dragged)
    if (selectedCurrent && !userInteracted.current) {
      const targetRotation: [number, number, number] = [-selectedCurrent.coordinates[1], -selectedCurrent.coordinates[0], 0];
      const interpolate = d3.interpolate(rotation, targetRotation);
      
      let elapsed = 0;
      const duration = 1200;
      
      autoRotateTimer.current = d3.timer((t) => {
        elapsed = t;
        if (elapsed > duration) {
          setRotation(targetRotation);
          autoRotateTimer.current?.stop();
        } else {
          setRotation(interpolate(elapsed / duration) as [number, number, number]);
        }
      });
    } 
    // If nothing selected, or after selection, do slow auto-rotation?
    else if (!selectedCurrent && !userInteracted.current) {
        autoRotateTimer.current = d3.timer((elapsed) => {
             setRotation([elapsed * 0.005, -15, 0]);
        });
    }

    return () => {
        if (autoRotateTimer.current) autoRotateTimer.current.stop();
    };
  }, [selectedCurrent, isDragging.current]); // Intentionally verify specific dependencies

  // D3 Rendering Loop
  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); 

    // Define Styles
    const defs = svg.append('defs');
    
    // Animation for flow lines
    defs.append('style').text(`
      @keyframes flowAnimation {
        to { stroke-dashoffset: 0; }
      }
    `);

    // Arrow Marker (Standard SVG Marker approach doesn't bend with globe well, so we draw manual arrows)
    // Glow Filter
    const filter = defs.append('filter')
        .attr('id', 'glow')
        .attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '2').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const projection = d3.geoOrthographic()
      .fitSize([dimensions.width, dimensions.height], geoData)
      .rotate(rotation)
      .scale(dimensions.height / 2.2)
      .translate([dimensions.width / 2, dimensions.height / 2])
      .clipAngle(90); // IMPORTANT: Clip back-face elements

    const pathGenerator = d3.geoPath().projection(projection);

    // 1. Ocean Background
    svg.append('path')
      .datum({ type: 'Sphere' })
      .attr('d', pathGenerator)
      .attr('fill', '#020617')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1.5);

    // 2. Land Masses
    svg.append('g')
      .selectAll('path')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('d', pathGenerator as any)
      .attr('fill', '#0f172a')
      .attr('stroke', '#334155')
      .attr('stroke-width', 0.5);

    // 3. Currents Layer
    const currentGroup = svg.append('g').style('filter', 'url(#glow)');

    currents.forEach(curr => {
        const isSelected = selectedCurrent?.id === curr.id;
        const baseColor = curr.type === 'Warm' ? '#ef4444' : '#3b82f6';
        const arrowColor = curr.type === 'Warm' ? '#fecaca' : '#bfdbfe';

        // --- A. Flow Line (The path) ---
        const lineString = {
            type: 'LineString',
            coordinates: curr.pathNodes.map(p => [p[1], p[0]]) 
        };

        // Dashed Flow Effect
        const dashSpeed = Math.max(0.5, 4 / curr.avgSpeedKnots); // Faster knots = lower seconds
        
        currentGroup.append('path')
            .datum(lineString)
            .attr('d', pathGenerator as any)
            .attr('fill', 'none')
            .attr('stroke', baseColor)
            .attr('stroke-width', isSelected ? 2.5 : 1.5)
            .attr('stroke-dasharray', '4, 6') // 4px draw, 6px gap
            .attr('stroke-dashoffset', '10')
            .attr('stroke-linecap', 'round')
            .attr('opacity', isSelected ? 1 : 0.6)
            .style('animation', `flowAnimation ${dashSpeed}s linear infinite`);

        // --- B. Vector Arrows (Directional Indicators) ---
        // To draw arrows that follow the curve, we interpolate points along the path
        
        // Simple approach: Draw an arrow at every node (except the last one) pointing to the next
        curr.pathNodes.forEach((node, idx) => {
            if (idx >= curr.pathNodes.length - 1) return;
            
            const start = node; // [lat, lng]
            const end = curr.pathNodes[idx + 1]; // [lat, lng]
            
            // Calculate midpoint for arrow placement
            const midLat = (start[0] + end[0]) / 2;
            const midLng = (start[1] + end[1]) / 2;
            
            // VISIBILITY CHECK:
            // Use pathGenerator to check if the point is visible on the current sphere face.
            // If the point is clipped (behind the globe), pathGenerator returns null.
            const isVisible = pathGenerator({type: 'Point', coordinates: [midLng, midLat]});

            if (isVisible) {
                const projStart = projection([midLng, midLat]);
                const p1 = projection([start[1], start[0]]);
                const p2 = projection([end[1], end[0]]);

                if (projStart && p1 && p2) {
                    const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * (180 / Math.PI);
                    
                    // Draw Arrow Shape (Chevron)
                    currentGroup.append('path')
                        .attr('d', 'M -4 -4 L 0 0 L -4 4') // Simple arrowhead pointing right
                        .attr('fill', 'none')
                        .attr('stroke', arrowColor)
                        .attr('stroke-width', 2)
                        .attr('stroke-linecap', 'round')
                        .attr('stroke-linejoin', 'round')
                        .attr('transform', `translate(${projStart[0]}, ${projStart[1]}) rotate(${angle})`)
                        .attr('opacity', isSelected ? 1 : 0.7);
                }
            }
        });

        // --- C. Interactive Click Target (Invisible but larger) ---
        // We draw invisible wide paths to make clicking easier
        currentGroup.append('path')
            .datum(lineString)
            .attr('d', pathGenerator as any)
            .attr('fill', 'none')
            .attr('stroke', 'transparent')
            .attr('stroke-width', 15)
            .attr('class', 'cursor-pointer')
            .on('click', (e) => {
                e.stopPropagation(); // Prevent drag start from eating click
                onSelectCurrent(curr);
            });
            
    });

  }, [geoData, dimensions, rotation, selectedCurrent, currents]);

  // --- Handlers ---

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    userInteracted.current = true; // Mark that user took control
    lastPos.current = [e.clientX, e.clientY];
    
    // Stop auto-rotation immediately
    if (autoRotateTimer.current) {
        autoRotateTimer.current.stop();
        autoRotateTimer.current = null;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !lastPos.current) return;
    
    const [x, y] = [e.clientX, e.clientY];
    const [dx, dy] = [x - lastPos.current[0], y - lastPos.current[1]];
    
    // Sensitivity factor
    const sensitivity = 0.3;
    
    // Update rotation state directly
    setRotation(r => [r[0] + dx * sensitivity, r[1] - dy * sensitivity, r[2]]);
    lastPos.current = [x, y];
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    lastPos.current = null;
  };

  return (
    <div 
        ref={wrapperRef} 
        className="w-full h-full cursor-move relative overflow-hidden bg-slate-950"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
        <div className="absolute bottom-6 left-6 z-10 pointer-events-none select-none">
             <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                    <span className="w-8 h-0.5 border-t border-dashed border-red-400/80"></span>
                    <span>Warm Flow</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-8 h-0.5 border-t border-dashed border-blue-400/80"></span>
                    <span>Cold Flow</span>
                </div>
             </div>
             <div className="mt-1 text-[10px] text-slate-500">
                {selectedCurrent ? 'Tap map to free rotate' : 'Drag to rotate globe'}
             </div>
        </div>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="block" />
    </div>
  );
};

export default GlobeVisualization;