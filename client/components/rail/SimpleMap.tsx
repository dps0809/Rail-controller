import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function SimpleMap() {
  return (
    <div style={{ height: '500px', width: '100%' }}>
      <MapContainer 
        center={[19.0760, 72.8777]} 
        zoom={10} 
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[19.0760, 72.8777]}>
          <Popup>
            Mumbai Railway Station
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
