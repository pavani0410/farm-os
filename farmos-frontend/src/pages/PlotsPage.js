import React, { useEffect, useRef, useState, useCallback } from 'react';
import api from '../services/api';

const COLORS = ['#1D9E75','#378ADD','#BA7517','#D85A30','#7F77DD','#D4537E'];
const FILLS  = ['rgba(29,158,117,0.12)','rgba(55,138,221,0.12)','rgba(186,117,23,0.12)','rgba(216,90,48,0.12)','rgba(127,119,221,0.12)','rgba(212,83,126,0.12)'];

function dist(a, b) { return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2); }

function polyArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i+1) % pts.length;
    a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(a/2);
}

function pxAreaToM2(pxArea, scale) { return pxArea * scale * scale; }
function m2ToAcres(m2) { return m2 / 4046.86; }
function m2ToFt2(m2) { return m2 * 10.7639; }
function mToFt(m) { return m * 3.28084; }

function formatDist(px, scale, unit) {
  const m = px * scale;
  if (unit === 'ft') {
    const ft = mToFt(m);
    return ft >= 5280 ? (ft/5280).toFixed(2)+'mi' : Math.round(ft)+'ft';
  }
  return m >= 1000 ? (m/1000).toFixed(2)+'km' : Math.round(m)+'m';
}

function formatArea(pxArea, scale, unit) {
  const m2 = pxAreaToM2(pxArea, scale);
  if (unit === 'ft') return Math.round(m2ToFt2(m2)).toLocaleString()+' ft²';
  if (unit === 'acres') return m2ToAcres(m2).toFixed(3)+' acres';
  return Math.round(m2).toLocaleString()+' m²';
}

function formatAreaFull(pxArea, scale) {
  const m2 = pxAreaToM2(pxArea, scale);
  return {
    m2: Math.round(m2),
    acres: parseFloat(m2ToAcres(m2).toFixed(4)),
    display: Math.round(m2).toLocaleString()+' m² / '+m2ToAcres(m2).toFixed(3)+' acres'
  };
}

function pointInPolygon(pos, points) {
  let inside = false;
  for (let i=0, j=points.length-1; i<points.length; j=i++) {
    const xi=points[i].x, yi=points[i].y;
    const xj=points[j].x, yj=points[j].y;
    const intersect = ((yi>pos.y)!==(yj>pos.y)) && (pos.x < (xj-xi)*(pos.y-yi)/(yj-yi)+xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function drawPlotOnCanvas(ctx, plot, scale, unit, isSelected, showLabel) {
  if (!plot.points || plot.points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(plot.points[0].x, plot.points[0].y);
  plot.points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fillStyle = plot.fill;
  ctx.fill();
  ctx.strokeStyle = plot.color;
  ctx.lineWidth = isSelected ? 2.5 : 1.5;
  ctx.setLineDash(isSelected ? [6,3] : []);
  ctx.stroke();
  ctx.setLineDash([]);

  plot.points.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
    ctx.fillStyle = plot.color;
    ctx.fill();
    const next = plot.points[(i+1) % plot.points.length];
    const mx = (p.x+next.x)/2;
    const my = (p.y+next.y)/2;
    ctx.font = '10px sans-serif';
    ctx.fillStyle = plot.color;
    ctx.textAlign = 'center';
    ctx.fillText(formatDist(dist(p, next), scale, unit), mx, my-5);
  });

  if (showLabel) {
    const cx = plot.points.reduce((s,p)=>s+p.x,0)/plot.points.length;
    const cy = plot.points.reduce((s,p)=>s+p.y,0)/plot.points.length;
    ctx.font = '500 12px sans-serif';
    ctx.fillStyle = plot.color;
    ctx.textAlign = 'center';
    ctx.fillText(plot.name, cx, cy-6);
    ctx.font = '10px sans-serif';
    ctx.fillText(formatArea(polyArea(plot.points), scale, unit), cx, cy+10);
  }
}

function drawGrid(ctx, w, h) {
  ctx.strokeStyle = 'rgba(128,128,128,0.07)';
  ctx.lineWidth = 0.5;
  for (let x=0; x<w; x+=40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for (let y=0; y<h; y+=40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
}

export default function PlotsPage() {
  const canvasRef = useRef(null);
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [savedPlots, setSavedPlots] = useState([]);

  // view: 'new' | 'overview' | plotId (number)
  const [view, setView] = useState('overview');

  const [currentPoints, setCurrentPoints] = useState([]);
  const [mousePos, setMousePos] = useState(null);
  const [scale, setScale] = useState(2);
  const [unit, setUnit] = useState('m');
  const [showModal, setShowModal] = useState(false);
  const [pendingPolygon, setPendingPolygon] = useState(null);
  const [plotName, setPlotName] = useState('');
  const [soilType, setSoilType] = useState('Red Soil');
  const [pendingArea, setPendingArea] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, []);

  useEffect(() => {
    api.get('/farms').then(res => {
      setFarms(res.data);
      if (res.data.length > 0) setSelectedFarmId(res.data[0].id);
    });
  }, []);

  const fetchPlots = useCallback((farmId) => {
    api.get(`/farms/${farmId}/plots`).then(res => {
      const plots = res.data.map((p, i) => ({
        ...p,
        points: JSON.parse(p.polygonPoints),
        color: COLORS[i % COLORS.length],
        fill: FILLS[i % FILLS.length],
      }));
      setSavedPlots(plots);
    });
  }, []);

  useEffect(() => {
    if (!selectedFarmId) return;
    fetchPlots(selectedFarmId);
  }, [selectedFarmId, fetchPlots]);

  // clear drawing when switching view
  useEffect(() => {
    setCurrentPoints([]);
    setMousePos(null);
  }, [view]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);

    if (view === 'overview') {
      // show all plots together
      savedPlots.forEach(plot => drawPlotOnCanvas(ctx, plot, scale, unit, false, true));
      if (savedPlots.length === 0) {
        ctx.font = '13px sans-serif';
        ctx.fillStyle = 'rgba(128,128,128,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText('No plots yet — click + New Plot to start drawing', canvas.width/2, canvas.height/2);
      }
      return;
    }

    if (view === 'new') {
      // blank canvas for drawing
      // show current in-progress path
      if (mousePos) {
        if (currentPoints.length === 0) {
          ctx.beginPath();
          ctx.arc(mousePos.x, mousePos.y, 5, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(29,158,117,0.4)';
          ctx.fill();
          ctx.font = '11px sans-serif';
          ctx.fillStyle = 'rgba(29,158,117,0.7)';
          ctx.textAlign = 'center';
          ctx.fillText('Click to start drawing', mousePos.x, mousePos.y - 12);
          return;
        }

        // preview fill
        if (currentPoints.length > 2) {
          ctx.beginPath();
          ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
          currentPoints.forEach(p => ctx.lineTo(p.x, p.y));
          ctx.lineTo(mousePos.x, mousePos.y);
          ctx.closePath();
          ctx.fillStyle = 'rgba(29,158,117,0.08)';
          ctx.fill();
        }

        // dashed line
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        currentPoints.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.strokeStyle = '#1D9E75';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5,3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // points + distances
        currentPoints.forEach((p, i) => {
          const isFirst = i === 0;
          const nearFirst = isFirst && dist(mousePos, p) < 16 && currentPoints.length > 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, nearFirst ? 8 : 4, 0, Math.PI*2);
          ctx.fillStyle = nearFirst ? '#E24B4A' : '#1D9E75';
          ctx.fill();
          if (nearFirst) {
            ctx.font = '10px sans-serif';
            ctx.fillStyle = '#E24B4A';
            ctx.textAlign = 'center';
            ctx.fillText('Close shape', p.x, p.y - 14);
          }
          const next = i < currentPoints.length-1 ? currentPoints[i+1] : mousePos;
          const mx = (p.x+next.x)/2;
          const my = (p.y+next.y)/2;
          ctx.font = '10px sans-serif';
          ctx.fillStyle = '#1D9E75';
          ctx.textAlign = 'center';
          ctx.fillText(formatDist(dist(p,next), scale, unit), mx, my-5);
        });

        // live area
        if (currentPoints.length > 1) {
          const aStr = formatArea(polyArea([...currentPoints, mousePos]), scale, unit);
          ctx.font = '11px sans-serif';
          ctx.fillStyle = '#1D9E75';
          ctx.textAlign = 'left';
          ctx.fillText('Area: '+aStr+' · '+currentPoints.length+' points', 10, canvas.height-10);
        }
      }
      return;
    }

    // single plot view — show just this plot
    const plot = savedPlots.find(p => p.id === view);
    if (plot) drawPlotOnCanvas(ctx, plot, scale, unit, true, true);

  }, [view, savedPlots, currentPoints, mousePos, scale, unit]);

  useEffect(() => { redraw(); }, [redraw]);

  const handleClick = useCallback((e) => {
    if (view !== 'new') return;
    const pos = getPos(e);
    if (currentPoints.length > 2 && dist(pos, currentPoints[0]) < 16) {
      const pxArea = polyArea(currentPoints);
      setPendingPolygon([...currentPoints]);
      setPendingArea(formatAreaFull(pxArea, scale));
      setCurrentPoints([]);
      setShowModal(true);
      return;
    }
    setCurrentPoints(prev => [...prev, pos]);
  }, [view, currentPoints, scale, getPos]);

  const handleMouseMove = useCallback((e) => {
    if (view === 'new') setMousePos(getPos(e));
    else setMousePos(null);
  }, [view, getPos]);

  const handleRightClick = useCallback((e) => {
    e.preventDefault();
    if (view === 'new') setCurrentPoints(prev => prev.slice(0, -1));
  }, [view]);

  const handleSave = async () => {
    if (!plotName.trim()) { alert('Please enter a plot name'); return; }
    setLoading(true);
    try {
      await api.post(`/farms/${selectedFarmId}/plots`, {
        name: plotName, soilType,
        areaM2: pendingArea.m2,
        areaAcres: pendingArea.acres,
        polygonPoints: JSON.stringify(pendingPolygon),
      });
      await fetchPlots(selectedFarmId);
      setShowModal(false);
      setPlotName('');
      setPendingPolygon(null);
      setView('overview'); // go back to overview after saving
    } catch { alert('Error saving plot'); }
    setLoading(false);
  };

  const handleDelete = async (plotId) => {
    if (!window.confirm('Delete this plot?')) return;
    try {
      await api.delete(`/farms/${selectedFarmId}/plots/${plotId}`);
      setSavedPlots(prev => prev.filter(p => p.id !== plotId));
      if (view === plotId) setView('overview');
    } catch { alert('Error deleting plot'); }
  };

  const activePlot = typeof view === 'number' ? savedPlots.find(p => p.id === view) : null;

  return (
    <div className="max-w-6xl mx-auto">

      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Plot mapper</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {view === 'new' ? 'Click to place points · Right-click or button to undo · Click first point to close shape'
             : view === 'overview' ? `${savedPlots.length} plots · ${savedPlots.reduce((s,p)=>s+(p.areaAcres||0),0).toFixed(2)} acres total`
             : `Viewing: ${activePlot?.name}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedFarmId||''} onChange={e=>setSelectedFarmId(Number(e.target.value))}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white">
            {farms.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <select value={scale} onChange={e=>setScale(Number(e.target.value))}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white">
            <option value={1}>1px = 1m</option>
            <option value={2}>1px = 2m</option>
            <option value={5}>1px = 5m</option>
            <option value={10}>1px = 10m</option>
          </select>
          <select value={unit} onChange={e=>setUnit(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white">
            <option value="m">Metres</option>
            <option value="ft">Feet</option>
            <option value="acres">Acres</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">

        {/* left panel */}
        <div className="w-48 flex-shrink-0 flex flex-col gap-1">

          {/* new plot button */}
          <button onClick={()=>setView('new')}
            className={`w-full text-xs px-3 py-2.5 rounded-lg border flex items-center gap-2 transition-colors font-medium ${
              view==='new' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
            <span className="text-base leading-none">+</span> New plot
          </button>

          {/* overview button */}
          <button onClick={()=>setView('overview')}
            className={`w-full text-xs px-3 py-2.5 rounded-lg border flex items-center gap-2 transition-colors ${
              view==='overview' ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            <span className="text-base leading-none">⊞</span> Overview
            <span className="ml-auto text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{savedPlots.length}</span>
          </button>

          {/* divider */}
          {savedPlots.length > 0 && (
            <div className="text-[10px] text-gray-400 px-1 pt-2 pb-0.5 uppercase tracking-widest">Saved plots</div>
          )}

          {/* plot list */}
          {savedPlots.map(plot => (
            <div key={plot.id}
              className={`w-full text-xs px-3 py-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors group ${
                view===plot.id ? 'border-gray-300 bg-gray-50 text-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              onClick={()=>setView(plot.id)}>
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{background:plot.color}}></div>
              <span className="flex-1 truncate">{plot.name}</span>
              <button
                onClick={e=>{e.stopPropagation();handleDelete(plot.id);}}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity text-xs leading-none">
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* right: canvas area */}
        <div className="flex-1 flex flex-col gap-2">

          {/* toolbar — only show when drawing */}
          {view === 'new' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPoints(prev => prev.slice(0, -1))}
                disabled={currentPoints.length === 0}
                className="text-xs px-3 py-1.5 rounded-lg border bg-white text-gray-600 border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                ↩ Undo last
              </button>
              <button
                onClick={() => {
                  setCurrentPoints([]);   // ← this is the fix: directly set to empty array
                  setMousePos(null);
                }}
                disabled={currentPoints.length === 0}
                className="text-xs px-3 py-1.5 rounded-lg border bg-white text-red-500 border-red-200 hover:bg-red-50 disabled:opacity-40">
                ✕ Clear drawing
              </button>
              <span className="ml-auto text-xs text-gray-400">
                {currentPoints.length > 0 ? `${currentPoints.length} points placed` : 'Click anywhere to start'}
              </span>
            </div>
          )}

          {/* canvas */}
          <div className={`border rounded-xl overflow-hidden ${view==='new'?'bg-white border-emerald-100':'bg-gray-50 border-gray-200'}`}>
            <canvas
              ref={canvasRef}
              width={700}
              height={460}
              onClick={handleClick}
              onMouseMove={handleMouseMove}
              onContextMenu={handleRightClick}
              style={{
                display: 'block',
                width: '100%',
                height: '460px',
                cursor: view==='new' ? 'crosshair' : 'default'
              }}
            />
          </div>

          {/* single plot detail */}
          {activePlot && (
            <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{background:activePlot.color}}></div>
                <span className="text-sm font-medium text-gray-800">{activePlot.name}</span>
              </div>
              <div className="text-xs text-gray-500">{activePlot.soilType}</div>
              <div className="text-xs text-gray-500">{activePlot.areaAcres?.toFixed(3)} acres</div>
              <div className="text-xs text-gray-500">{activePlot.areaM2?.toLocaleString()} m²</div>
              <button onClick={()=>handleDelete(activePlot.id)}
                className="ml-auto text-xs text-red-400 hover:text-red-600 border border-red-100 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors">
                🗑 Delete plot
              </button>
            </div>
          )}
        </div>
      </div>

      {/* modal */}
      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}}>
          <div className="bg-white rounded-xl border border-gray-200 p-6 w-80 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Name this plot</h3>
            <div className="mb-3">
              <label className="text-xs text-gray-500 block mb-1">Plot name</label>
              <input autoFocus type="text" value={plotName} onChange={e=>setPlotName(e.target.value)}
                placeholder="e.g. North Field"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
                onKeyDown={e=>e.key==='Enter'&&handleSave()} />
            </div>
            <div className="mb-3">
              <label className="text-xs text-gray-500 block mb-1">Soil type</label>
              <select value={soilType} onChange={e=>setSoilType(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2">
                <option>Red Soil</option>
                <option>Black Soil</option>
                <option>Sandy Soil</option>
                <option>Loamy Soil</option>
                <option>Clay Soil</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="text-xs text-gray-500 block mb-1">Calculated area</label>
              <div className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700">
                {pendingArea?.display}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={loading}
                className="flex-1 text-sm bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                {loading ? 'Saving...' : 'Save plot'}
              </button>
              <button onClick={()=>{setShowModal(false);setPendingPolygon(null);}}
                className="text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}