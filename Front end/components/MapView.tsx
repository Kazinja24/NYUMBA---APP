import React, { useEffect, useRef } from 'react';
import { Property } from '../types';

interface MapViewProps {
  properties: Property[];
  className?: string;
}

const MapView: React.FC<MapViewProps> = ({ properties, className }) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if Leaflet is loaded
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    if (!mapRef.current) {
      // Initialize map
      // Default center Dar es Salaam
      mapRef.current = L.map(mapContainerRef.current).setView([-6.7924, 39.2083], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }

    // Clear existing layers (markers)
    mapRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
            mapRef.current.removeLayer(layer);
        }
    });

    // Add markers for properties
    const markers: any[] = [];
    properties.forEach(prop => {
        if (prop.coordinates) {
            const marker = L.marker([prop.coordinates.lat, prop.coordinates.lng])
                .addTo(mapRef.current)
                .bindPopup(`
                    <div style="min-width: 150px">
                        <img src="${prop.images[0]}" style="width:100%; height:80px; object-fit:cover; border-radius: 4px; margin-bottom: 4px" />
                        <strong>${prop.title}</strong><br/>
                        ${(prop.price).toLocaleString()} TZS<br/>
                        <span style="font-size:0.8em; color:gray">${prop.type}</span>
                    </div>
                `);
            markers.push(marker);
        }
    });

    // Fit bounds if we have markers
    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        mapRef.current.fitBounds(group.getBounds().pad(0.1), {
             padding: [50, 50],
             maxZoom: 15,
             animate: false
        });
    }

    // Cleanup on unmount
    return () => {
        if (mapRef.current) {
             // We keep the instance alive for simple re-renders, or handle full cleanup if needed
             // mapRef.current.remove(); 
        }
    };
  }, [properties]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    }
  }, []);

  return (
    <div className={`w-full rounded-xl overflow-hidden z-0 ${className || 'h-full min-h-[400px]'}`} ref={mapContainerRef}></div>
  );
};

export default MapView;