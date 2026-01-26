import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { OceanCurrent } from '../types';
import { MOCK_GEO_JSON_URL } from '../constants';

interface Props {
  selectedCurrent: OceanCurrent | null;
  onSelectCurrent: (current: OceanCurrent) => void;
  currents: OceanCurrent[];
}

const getSunPosition = (date: Date): [number, number] => {
  const phi = (date.getUTCHours() + date.getUTCMinutes() / 60) * 15 - 180;
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const theta = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10)); 
  return [-phi, theta];
};

const GlobeVisualization: React.FC<Props> = ({ selectedCurrent, onSelectCurrent, currents }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const [geoData, setGeoData] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 });
  const [sunPosition, setSunPosition] = useState<[number, number]>([0, 0]);

  // Use a ref to store props for use in the D3 timer without stale closures
  const propsRef = useRef({ selectedCurrent, currents, onSelectCurrent });
  useEffect(() => {
    propsRef.current = { selectedCurrent, currents, onSelectCurrent };
  }, [selectedCurrent, currents, onSelectCurrent]);

  const tState = useRef({
    scale: 350,
    rotation: [0, -10, 0] as [number, number, number], // [Lambda (Lng), Phi (Lat), Gamma]
    time: 0, 
    isDragging: false,
    lastMouse: [0, 0] as [number, number],
    // If set, the globe interpolates towards this target.
    // If null, it is in free/idle mode.
    targetRotation: null as [number, number] | null, 
  });

  // When selectedCurrent changes, set a new target for the camera
  useEffect(() => {
    if (selectedCurrent) {
        // D3 Rotation center is inverted.
        // To center on [Lat, Lng], we need rotation [-Lng, -Lat].
        // selectedCurrent.coordinates is [Lat, Lng].
        const targetLng = -selectedCurrent.coordinates[1];
        const targetLat = -selectedCurrent.coordinates[0];
        
        tState.current.targetRotation = [targetLng, targetLat];
    }
  }, [selectedCurrent?.id]);

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
        tState.current.scale = clientHeight / 2.2;
      }
    };
    
    setSunPosition(getSunPosition(new Date()));
    const sunInterval = setInterval(() => {
        setSunPosition(getSunPosition(new Date()));
    }, 60000);

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
        window.removeEventListener('resize', handleResize);
        clearInterval(sunInterval);
    };
  }, []);

  const backgroundParticles = useMemo(() => {
    const particles: { start: [number, number], end: [number, number] }[] = [];
    for (let lat = -80; lat <= 80; lat += 4) {
        for (let lng = -180; lng <= 180; lng += 4) {
            let dirX = 0;
            const absLat = Math.abs(lat);
            if (absLat < 25) dirX = -1.5; 
            else if (absLat < 60) dirX = 1.5; 
            else dirX = -1.0; 

            const noiseLat = (Math.random() - 0.5) * 2.0;
            const noiseLng = (Math.random() - 0.5) * 2.0;
            const start: [number, number] = [lng + noiseLng, lat + noiseLat];
            const lengthMultiplier = 3.5; 
            const end: [number, number] = [
                start[0] + dirX * lengthMultiplier, 
                start[1] + (Math.random() - 0.5) * 0.5
            ];
            particles.push({ start, end });
        }
    }
    return particles;
  }, []);

  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    // Defs
    const defs = svg.append('defs');
    
    defs.append('marker')
        .attr('id', 'arrow-micro')
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 9).attr('refY', 5)
        .attr('markerWidth', 3).attr('markerHeight', 3)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 z')
        .attr('fill', '#22d3ee');

    const filter = defs.append('filter')
        .attr('id', 'glow')
        .attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const oceanLayer = svg.append('path').attr('class', 'ocean');
    const microFlowLayer = svg.append('path').attr('class', 'micro-flows');
    const landLayer = svg.append('path').attr('class', 'land');
    const nightLayer = svg.append('path').attr('class', 'night-shadow');
    const currentsLayer = svg.append('g').attr('class', 'currents').style('filter', 'url(#glow)');

    const microFlowGeoJson = {
        type: 'MultiLineString',
        coordinates: backgroundParticles.map(p => [p.start, p.end])
    };

    const projection = d3.geoOrthographic().clipAngle(90);
    const pathGenerator = d3.geoPath().projection(projection);

    const timer = d3.timer((elapsed) => {
        const state = tState.current;
        const currentProps = propsRef.current;
        
        state.time += 1;

        // --- Rotation Update Logic ---
        if (state.isDragging) {
            // User is in control, clear auto-target
            state.targetRotation = null;
        } else if (state.targetRotation) {
            // Auto-focus mode
            const [tLng, tLat] = state.targetRotation;
            const [cLng, cLat] = state.rotation;

            // Shortest path logic for Longitude
            let dLng = tLng - cLng;
            // Normalize dLng to [-180, 180] to find shortest turn
            while (dLng > 180) dLng -= 360;
            while (dLng < -180) dLng += 360;

            const dLat = tLat - cLat;

            // Smooth interpolation factor
            const k = 0.08;

            if (Math.abs(dLng) < 0.2 && Math.abs(dLat) < 0.2) {
                // Arrived at target. Snap and clear target to allow idle float or small adjustments without locking.
                // We keep targetRotation null so it doesn't fight small mouse movements if they happen.
                state.rotation[0] = tLng;
                state.rotation[1] = tLat;
                state.targetRotation = null; 
            } else {
                state.rotation[0] += dLng * k;
                state.rotation[1] += dLat * k;
            }
        } else {
            // Idle rotation (Slow spin)
            state.rotation[0] += 0.05;
        }

        // Normalize global rotation state to [-180, 180] to prevent huge numbers
        if (state.rotation[0] > 180) state.rotation[0] -= 360;
        if (state.rotation[0] < -180) state.rotation[0] += 360;

        // Apply to Projection
        projection
            .scale(state.scale)
            .translate([dimensions.width / 2, dimensions.height / 2])
            .rotate(state.rotation);

        // --- Render ---
        oceanLayer.datum({ type: 'Sphere' })
            .attr('d', pathGenerator as any)
            .attr('fill', '#0f172a')
            .attr('stroke', '#334155')
            .attr('stroke-width', 1.0);
            
        landLayer.datum(geoData)
            .attr('d', pathGenerator as any)
            .attr('fill', '#64748b')
            .attr('stroke', '#cbd5e1')
            .attr('stroke-width', 0.5);

        microFlowLayer.datum(microFlowGeoJson)
            .attr('d', pathGenerator as any)
            .attr('fill', 'none')
            .attr('stroke', '#22d3ee')
            .attr('stroke-width', 1.0)
            .attr('opacity', 0.5)
            .attr('marker-end', 'url(#arrow-micro)')
            .attr('stroke-dasharray', '4, 8')
            .attr('stroke-dashoffset', -state.time * 0.5);

        const sunAntipode: [number, number] = [sunPosition[0] + 180, -sunPosition[1]];
        const nightCircle = d3.geoCircle().radius(90).center(sunAntipode)();
        nightLayer.datum(nightCircle)
            .attr('d', pathGenerator as any)
            .attr('fill', '#000000')
            .attr('fill-opacity', 0.55);

        // --- Currents Layer ---
        const groups = currentsLayer.selectAll('g.current-group')
            .data(currentProps.currents, (d: any) => d.id);

        const groupsEnter = groups.enter().append('g').attr('class', 'current-group');
        groupsEnter.append('path').attr('class', 'current-path-main')
            .attr('fill', 'none').attr('stroke-linecap', 'round');
            
        // Hit area for easier selection
        groupsEnter.append('path').attr('class', 'hit-area')
            .attr('fill', 'none')
            .attr('stroke', 'transparent')
            .attr('stroke-width', 12) // Reduced slightly to prevent overlap
            .style('cursor', 'pointer')
            .on('mouseover', function() {
                d3.select(this).attr('stroke', 'rgba(255, 255, 255, 0.1)'); // Highlight on hover
            })
            .on('mouseout', function() {
                d3.select(this).attr('stroke', 'transparent');
            })
            .on('click', (e, d) => {
                e.stopPropagation();
                propsRef.current.onSelectCurrent(d);
            });

        const allGroups = groups.merge(groupsEnter as any);
        
        allGroups.each(function(d) {
            const group = d3.select(this);
            const curr = d as OceanCurrent;
            const isSelected = currentProps.selectedCurrent?.id === curr.id;

            // IMPORTANT: D3 GeoJSON coordinates are [Lng, Lat]
            // curr.pathNodes are [Lat, Lng] based on usage in constants.ts
            // So we map p => [p[1], p[0]] to get [Lng, Lat]
            const lineString = {
                type: 'LineString',
                coordinates: curr.pathNodes.map(p => [p[1], p[0]]) 
            };

            const path = group.select('.current-path-main');
            path.datum(lineString)
                .attr('d', pathGenerator as any)
                .attr('stroke', curr.type === 'Warm' ? '#ef4444' : '#3b82f6')
                .attr('stroke-width', isSelected ? 4.0 : 2.0)
                .attr('stroke-dasharray', isSelected ? '8, 4' : '6, 6')
                .attr('opacity', isSelected ? 1 : 0.85)
                .attr('stroke-dashoffset', -state.time * (curr.avgSpeedKnots * 0.5));

            group.select('.hit-area').datum(lineString).attr('d', pathGenerator as any);

            // Dynamic Arrows
            group.selectAll('.arrow-dynamic').remove();
            
            // Only draw arrows if visible to save perf
            if (!pathGenerator(lineString as any)) return;

            curr.pathNodes.forEach((node, idx) => {
                if (idx % 2 !== 0) return; // Draw fewer arrows for cleaner look
                if (idx >= curr.pathNodes.length - 1) return;
                
                const start = node;
                const end = curr.pathNodes[idx + 1];
                const midLat = (start[0] + end[0]) / 2;
                const midLng = (start[1] + end[1]) / 2;
                
                // Projection input is [Lng, Lat]
                const projMid = projection([midLng, midLat]);
                
                // Simple visibility check: if projection returns null, it's behind the globe (clipped)
                if (projMid) {
                    const p1 = projection([start[1], start[0]]);
                    const p2 = projection([end[1], end[0]]);
                    
                    if (p1 && p2) {
                         const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * (180 / Math.PI);
                         group.append('path')
                            .attr('class', 'arrow-dynamic')
                            .attr('d', 'M -4 -4 L 0 0 L -4 4')
                            .attr('fill', 'none')
                            .attr('stroke', curr.type === 'Warm' ? '#fee2e2' : '#dbeafe')
                            .attr('stroke-width', 2)
                            .attr('stroke-linecap', 'round')
                            .attr('stroke-linejoin', 'round')
                            .attr('transform', `translate(${projMid[0]}, ${projMid[1]}) rotate(${angle})`)
                            .attr('opacity', isSelected ? 1 : 0.8)
                            .style('pointer-events', 'none');
                    }
                }
            });
        });
        
        groups.exit().remove();
    });

    return () => {
        timer.stop();
    };
  }, [geoData, dimensions, sunPosition, backgroundParticles]); 

  // --- Interaction Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    tState.current.isDragging = true;
    tState.current.lastMouse = [e.clientX, e.clientY];
    tState.current.targetRotation = null; // User takes control
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!tState.current.isDragging) return;
    const [x, y] = [e.clientX, e.clientY];
    const [dx, dy] = [x - tState.current.lastMouse[0], y - tState.current.lastMouse[1]];
    
    const sensitivity = 0.25;
    tState.current.rotation[0] += dx * sensitivity;
    tState.current.rotation[1] -= dy * sensitivity;
    // Clamp latitude to avoid gimbal lock visual issues
    tState.current.rotation[1] = Math.max(-85, Math.min(85, tState.current.rotation[1]));

    tState.current.lastMouse = [x, y];
  };

  const handleMouseUp = () => {
    tState.current.isDragging = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    tState.current.targetRotation = null; // Zooming also breaks auto-focus lock
    
    const minScale = dimensions.height / 3;
    const maxScale = dimensions.height * 2.5;
    const zoomIntensity = 0.0015;
    const delta = -e.deltaY;
    
    const newScale = tState.current.scale * (1 + delta * zoomIntensity);
    tState.current.scale = Math.max(minScale, Math.min(maxScale, newScale));
  };

  return (
    <div 
        ref={wrapperRef} 
        className="w-full h-full cursor-move relative overflow-hidden bg-slate-950"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
    >
        <div className="absolute bottom-6 left-6 z-10 pointer-events-none select-none">
             <div className="flex flex-col gap-2 bg-slate-900/50 p-3 rounded-lg backdrop-blur-sm border border-slate-700/50">
                <div className="flex items-center gap-3 text-xs text-slate-300">
                    <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-500"></div>
                    <span>Night</span>
                    <div className="w-3 h-3 rounded-full bg-slate-600 border border-slate-400"></div>
                    <span>Day</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                    <span className="w-8 h-0.5 border-t border-dashed border-red-400"></span>
                    <span>Warm</span>
                    <span className="w-8 h-0.5 border-t border-dashed border-blue-400"></span>
                    <span>Cold</span>
                </div>
             </div>
             <div className="mt-2 text-[10px] text-slate-500 pl-1">
                {tState.current.targetRotation ? 'Auto-Centering...' : 'Interactive Mode'}
             </div>
        </div>
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="block" />
    </div>
  );
};

export default React.memo(GlobeVisualization);