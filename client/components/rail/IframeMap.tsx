export default function IframeMap() {
  // Create a simple HTML page with the map
  const mapHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Railway Route Map</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossorigin=""/>
    <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100%; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
            crossorigin=""></script>
    <script>
        var map = L.map('map').setView([20.5937, 78.9629], 5);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        var stations = [
            [28.6139, 77.2090], // Delhi
            [19.0760, 72.8777]  // Mumbai
        ];
        
        stations.forEach(function(s){
            L.marker(s).addTo(map);
        });
        
        L.polyline(stations, {color: 'blue'}).addTo(map);
        
        console.log('Iframe map loaded successfully!');
    </script>
</body>
</html>`;

  const dataUri = `data:text/html;charset=utf-8,${encodeURIComponent(mapHtml)}`;

  return (
    <div style={{ padding: '10px' }}>
      <h3 style={{ marginBottom: '10px', color: '#333' }}>Railway Route Map (Iframe)</h3>
      <iframe 
        src={dataUri}
        style={{ 
          width: '100%', 
          height: '500px', 
          border: '2px solid #333', 
          borderRadius: '8px' 
        }}
        title="Railway Route Map"
      />
      <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        This uses an iframe with embedded OpenStreetMap - should work regardless of React issues.
      </p>
    </div>
  );
}
