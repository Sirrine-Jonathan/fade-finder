'use client';

import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ZoomIn, ZoomOut, MapPin } from 'lucide-react';

interface MapPreviewProps {
  latitude: number;
  longitude: number;
  label?: string;
  height?: string;
}

const PreviewWrapper = styled.div<{ height?: string }>`
  position: relative;
  width: 100%;
  height: ${({ height }) => height || '220px'};
  background-color: #0f172a;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 0.75rem;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

const FloatingPin = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  z-index: 10;
  animation: bounce 1s infinite alternate;

  @keyframes bounce {
    from { transform: translate(-50%, -100%) translateY(0); }
    to { transform: translate(-50%, -100%) translateY(-6px); }
  }
`;

const PinLabel = styled.div`
  background: rgba(15, 23, 42, 0.9);
  color: #f8fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.15);
  margin-top: 0.25rem;
  white-space: nowrap;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
`;

const Controls = styled.div`
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  z-index: 15;
`;

const MiniButton = styled.button`
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #f8fafc;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(30, 41, 59, 0.95);
    color: #f59e0b;
    border-color: #f59e0b;
  }
`;

export const MapPreview: React.FC<MapPreviewProps> = ({
  latitude,
  longitude,
  label,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1.2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Draw dark background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Draw coordinate grids
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();
    }
    for (let j = 0; j < h; j += 40) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(w, j);
      ctx.stroke();
    }

    // Convert coordinates to local grid offsets centered on the map
    const latToY = (lat: number) => h / 2 - (lat - latitude) * 2000 * zoom;
    const lngToX = (lng: number) => w / 2 + (lng - longitude) * 2000 * zoom * Math.cos(latitude * Math.PI / 180);

    // Draw parks
    ctx.fillStyle = 'rgba(16, 185, 129, 0.06)';
    ctx.beginPath();
    ctx.arc(w / 2 - 40, h / 2 + 30, 50 * zoom, 0, 2 * Math.PI);
    ctx.fill();

    // Draw river
    ctx.fillStyle = 'rgba(59, 130, 246, 0.06)';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 100, h / 2 - 80);
    ctx.bezierCurveTo(w / 2 - 20, h / 2 - 40, w / 2 + 20, h / 2 + 40, w / 2 + 100, h / 2 + 80);
    ctx.lineWidth = 20 * zoom;
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.06)';
    ctx.stroke();

    // Draw roads
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2 * zoom;
    const roads = [-0.01, -0.005, 0.0, 0.005, 0.01];
    roads.forEach((offset) => {
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(0, latToY(latitude + offset));
      ctx.lineTo(w, latToY(latitude + offset));
      ctx.stroke();

      // Vertical
      ctx.beginPath();
      ctx.moveTo(lngToX(longitude + offset), 0);
      ctx.lineTo(lngToX(longitude + offset), h);
      ctx.stroke();
    });

  }, [latitude, longitude, zoom]);

  return (
    <PreviewWrapper height={height}>
      <Canvas ref={canvasRef} width={400} height={220} />
      <FloatingPin>
        <MapPin size={22} color="#f59e0b" fill="#f59e0b" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} />
        {label && <PinLabel>{label}</PinLabel>}
      </FloatingPin>
      <Controls>
        <MiniButton onClick={() => setZoom((z) => Math.min(z + 0.25, 3.0))} type="button" title="Zoom In">
          <ZoomIn size={14} />
        </MiniButton>
        <MiniButton onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))} type="button" title="Zoom Out">
          <ZoomOut size={14} />
        </MiniButton>
      </Controls>
    </PreviewWrapper>
  );
};

export default MapPreview;
