'use client';

import React, { useRef, useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Compass, ZoomIn, ZoomOut, Scissors, Award, Star, ArrowRight, User } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { RatingStars } from './RatingStars';
import { useRouter } from 'next/navigation';

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  studioPrice: number;
  houseCallPrice: number;
}

interface Barber {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  licenseNumber: string;
  isVerified: boolean;
  baseAddress: string;
  rating: number;
  reviewCount: number;
  distanceMiles: number | null;
  maxTravelRadiusMiles: number;
  isWithinTravelRadius: boolean;
  services: Service[];
  slug: string;
  latitude: number;
  longitude: number;
}

interface MapViewProps {
  barbers: Barber[];
  userCoords: { lat: number; lng: number };
  centerCoords: { lat: number; lng: number };
  onCenterChange: (coords: { lat: number; lng: number }) => void;
  onLocateUser: () => void;
}

const MapWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  background-color: #0f172a;
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(2); opacity: 0.2; }
  100% { transform: scale(1); opacity: 0.6; }
`;

const GlowingUserPin = styled.div`
  position: absolute;
  width: 14px;
  height: 14px;
  background-color: #3b82f6;
  border: 2px solid #ffffff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  box-shadow: 0 0 10px #3b82f6;
  z-index: 10;

  &::after {
    content: '';
    position: absolute;
    top: -12px;
    left: -12px;
    right: -12px;
    bottom: -12px;
    border-radius: 50%;
    border: 2px solid #3b82f6;
    animation: ${pulse} 2s infinite ease-in-out;
  }
`;

const BarberPin = styled.button<{ active?: boolean }>`
  position: absolute;
  transform: translate(-50%, -50%);
  background-color: ${({ active }) => (active ? '#f59e0b' : '#1e293b')};
  color: ${({ active }) => (active ? '#ffffff' : '#f59e0b')};
  border: 2px solid #f59e0b;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: all 0.2s ease-in-out;
  z-index: 5;

  &:hover {
    transform: translate(-50%, -50%) scale(1.15);
    background-color: #f59e0b;
    color: #ffffff;
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.6);
    z-index: 6;
  }
`;

const ControlsContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 20;
`;

const MapButton = styled.button`
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.15s ease;

  &:hover {
    background: rgba(30, 41, 59, 0.95);
    border-color: #f59e0b;
    color: #f59e0b;
  }
`;

const BarberPopup = styled.div`
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  width: 340px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  z-index: 25;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  color: #f8fafc;
  animation: fadeIn 0.25s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const PopupHeader = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const PopupAvatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #f59e0b;
  object-fit: cover;
`;

const PopupInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PopupName = styled.h4`
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.15rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  &:hover { color: #f8fafc; }
`;

export const MapView: React.FC<MapViewProps> = ({
  barbers,
  userCoords,
  centerCoords,
  onCenterChange,
  onLocateUser,
}) => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1.2); // Map zoom multiplier
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Map canvas configurations
  const width = 800;
  const height = 600;
  // Convert coordinate offsets to canvas pixels
  const latToPixels = (lat: number) => {
    const latDiff = lat - centerCoords.lat;
    return height / 2 - latDiff * 3000 * zoom;
  };

  const lngToPixels = (lng: number) => {
    const lngDiff = lng - centerCoords.lng;
    return width / 2 + lngDiff * 3000 * zoom * Math.cos(centerCoords.lat * Math.PI / 180);
  };

  const pixelsToCoords = (x: number, y: number) => {
    const dx = x - width / 2;
    const dy = height / 2 - y;
    const cosLat = Math.cos(centerCoords.lat * Math.PI / 180);
    const lng = centerCoords.lng + dx / (3000 * zoom * cosLat);
    const lat = centerCoords.lat + dy / (3000 * zoom);
    return { lat, lng };
  };

  // Draw the custom stylized vector map on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, width, height);

    // Draw coordinate grids
    ctx.strokeStyle = '#1e293b'; // slate-800
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 80) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let j = 0; j < height; j += 80) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(width, j);
      ctx.stroke();
    }

    // Draw Parks (Mocking some green circular areas around the center coordinates)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)'; // emerald-500 low opacity
    const parkOffsets = [
      { dLat: 0.015, dLng: -0.02, r: 80 },
      { dLat: -0.025, dLng: 0.01, r: 120 },
      { dLat: -0.005, dLng: -0.04, r: 90 },
      { dLat: 0.03, dLng: 0.03, r: 100 },
    ];
    parkOffsets.forEach((p) => {
      const px = lngToPixels(centerCoords.lng + p.dLng);
      const py = latToPixels(centerCoords.lat + p.dLat);
      ctx.beginPath();
      ctx.arc(px, py, p.r * zoom, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw Rivers/Lakes (Mock water bodies)
    ctx.fillStyle = 'rgba(59, 130, 246, 0.08)'; // blue-500 low opacity
    ctx.beginPath();
    const riverY1 = latToPixels(centerCoords.lat + 0.05);
    const riverY2 = latToPixels(centerCoords.lat - 0.05);
    const riverX1 = lngToPixels(centerCoords.lng - 0.06);
    const riverX2 = lngToPixels(centerCoords.lng + 0.06);
    ctx.moveTo(riverX1, riverY1);
    ctx.quadraticCurveTo(width / 2 - 50, height / 2 - 100, riverX2, riverY2);
    ctx.lineWidth = 40 * zoom;
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
    ctx.stroke();

    // Draw Streets
    ctx.strokeStyle = '#1e293b'; // slate-800
    ctx.lineWidth = 3 * zoom;
    const roadConfigs = [
      // Horizontals
      { dLat: 0.02 }, { dLat: 0.01 }, { dLat: 0.0 }, { dLat: -0.01 }, { dLat: -0.02 }, { dLat: -0.03 },
      // Verticals
      { dLng: 0.03 }, { dLng: 0.015 }, { dLng: 0.0 }, { dLng: -0.015 }, { dLng: -0.03 }, { dLng: -0.045 },
    ];
    roadConfigs.forEach((road) => {
      ctx.beginPath();
      if ('dLat' in road) {
        const y = latToPixels(centerCoords.lat + road.dLat);
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      } else if ('dLng' in road) {
        const x = lngToPixels(centerCoords.lng + road.dLng);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      ctx.stroke();
    });

    // Draw Major Highway
    ctx.strokeStyle = '#334155'; // slate-700
    ctx.lineWidth = 6 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, height / 3);
    ctx.lineTo(width, (height * 2) / 3);
    ctx.stroke();
    
    ctx.strokeStyle = '#f59e0b'; // golden highway line
    ctx.lineWidth = 1 * zoom;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, height / 3);
    ctx.lineTo(width, (height * 2) / 3);
    ctx.stroke();
    ctx.setLineDash([]); // reset

  }, [centerCoords, zoom, userCoords]);

  // Handle dragging to pan the map
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    // Scale dragging factors
    const cosLat = Math.cos(centerCoords.lat * Math.PI / 180);
    const dLng = dx / (3000 * zoom * cosLat);
    const dLat = dy / (3000 * zoom);

    onCenterChange({
      lat: centerCoords.lat + dLat,
      lng: centerCoords.lng - dLng,
    });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Convert GPS coordinates into styles
  const userX = lngToPixels(userCoords.lng);
  const userY = latToPixels(userCoords.lat);

  const showUserPin = userX >= 0 && userX <= width && userY >= 0 && userY <= height;

  return (
    <MapWrapper>
      <Canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* User glowing GPS Pin */}
      {showUserPin && (
        <GlowingUserPin style={{ left: `${userX}px`, top: `${userY}px` }} />
      )}

      {/* Barbers Pins */}
      {barbers.map((b) => {
        const bx = lngToPixels(b.longitude);
        const by = latToPixels(b.latitude);

        // Render if inside map box bounds
        if (bx < 0 || bx > width || by < 0 || by > height) return null;

        return (
          <BarberPin
            key={b.id}
            style={{ left: `${bx}px`, top: `${by}px` }}
            active={selectedBarber?.id === b.id}
            onClick={() => setSelectedBarber(b)}
            title={b.name}
          >
            <Scissors size={14} />
          </BarberPin>
        );
      })}

      {/* Map Controls */}
      <ControlsContainer>
        <MapButton onClick={() => setZoom((z) => Math.min(z + 0.25, 4.0))} title="Zoom In">
          <ZoomIn size={18} />
        </MapButton>
        <MapButton onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))} title="Zoom Out">
          <ZoomOut size={18} />
        </MapButton>
        <MapButton onClick={onLocateUser} title="Center on GPS">
          <Compass size={18} />
        </MapButton>
      </ControlsContainer>

      {/* Barber Detail Preview Popup */}
      {selectedBarber && (
        <BarberPopup>
          <CloseButton onClick={() => setSelectedBarber(null)}>×</CloseButton>
          <PopupHeader>
            <PopupAvatar src={selectedBarber.avatarUrl || '/logo.png'} alt={selectedBarber.name} />
            <PopupInfo>
              <PopupName>{selectedBarber.name}</PopupName>
              <RatingStars rating={selectedBarber.rating} reviewCount={selectedBarber.reviewCount} size="sm" />
            </PopupInfo>
          </PopupHeader>

          {selectedBarber.isVerified && (
            <Badge variant="accent" size="sm" icon={<Award size={10} />}>
              DOPL Verified · {selectedBarber.licenseNumber}
            </Badge>
          )}

          <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.25rem 0 0.5rem' }}>
            {selectedBarber.baseAddress}
            {selectedBarber.distanceMiles !== null && (
              <span style={{ color: '#f59e0b', fontWeight: 'bold', marginLeft: '0.5rem' }}>
                ({selectedBarber.distanceMiles} mi away)
              </span>
            )}
          </p>

          {selectedBarber.services[0] && (
            <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
              Starts at ${selectedBarber.services[0].studioPrice} (Studio) / ${selectedBarber.services[0].houseCallPrice} (Mobile)
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <Button
              variant="outline"
              size="sm"
              style={{ flex: 1, fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
              onClick={() => router.push(`/${selectedBarber.slug || selectedBarber.id}`)}
            >
              Profile
            </Button>
            <Button
              variant="primary"
              size="sm"
              style={{ flex: 1, fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
              onClick={() => router.push(`/booking/${selectedBarber.slug || selectedBarber.id}`)}
            >
              Book <ArrowRight size={12} style={{ marginLeft: '2px' }} />
            </Button>
          </div>
        </BarberPopup>
      )}
    </MapWrapper>
  );
};

export default MapView;
