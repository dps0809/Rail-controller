import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mumbai to Pune railway stations with coordinates
const railwayStations = [
  { name: 'Mumbai CST', coordinates: [18.9398, 72.8355] as [number, number] },
  { name: 'Dadar', coordinates: [19.0176, 72.8562] as [number, number] },
  { name: 'Thane', coordinates: [19.2183, 72.9781] as [number, number] },
  { name: 'Kalyan', coordinates: [19.2437, 73.1355] as [number, number] },
  { name: 'Kasara', coordinates: [19.6167, 73.4833] as [number, number] },
  { name: 'Igatpuri', coordinates: [19.6961, 73.5625] as [number, number] },
  { name: 'Nashik Road', coordinates: [19.9975, 73.7898] as [number, number] },
  { name: 'Manmad', coordinates: [20.2551, 74.4399] as [number, number] },
  { name: 'Kopargaon', coordinates: [19.8833, 74.4833] as [number, number] },
  { name: 'Ahmednagar', coordinates: [19.0948, 74.7480] as [number, number] },
  { name: 'Belapur', coordinates: [18.9167, 74.0167] as [number, number] },
  { name: 'Daund', coordinates: [18.4648, 74.5815] as [number, number] },
  { name: 'Pune', coordinates: [18.5204, 73.8567] as [number, number] },
];

// Create railway route path
const railwayRoute = railwayStations.map(station => station.coordinates);

// Use default Leaflet marker for now
const railwayIcon = new L.Icon.Default();

interface RailwayMapProps {
  height?: number;
  activeStationId?: string | number;
}

export default function RailwayMap({ height = 600, activeStationId }: RailwayMapProps) {
  // Center the map between Mumbai and Pune
  const mapCenter: [number, number] = [19.2, 73.5];
  
  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={8}
        style={{ height: `${height}px`, width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Railway route polyline */}
        <Polyline
          positions={railwayRoute}
          pathOptions={{
            color: '#2563eb',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 5'
          }}
        />
        
        {/* Railway stations markers */}
        {railwayStations.map((station, index) => (
          <Marker
            key={index}
            position={station.coordinates}
            icon={railwayIcon}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold text-sm">{station.name}</h3>
                <p className="text-xs text-gray-600">Railway Station</p>
                <p className="text-xs">
                  {station.coordinates[0].toFixed(4)}, {station.coordinates[1].toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Highlight active station if provided */}
        {activeStationId && railwayStations[0] && (
          <Marker
            position={railwayStations[0].coordinates}
            icon={railwayIcon}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold text-sm text-blue-600">Active Station</h3>
                <p className="text-xs">Currently selected</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
