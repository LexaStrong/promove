'use client';

import React, { useEffect, useRef, useState } from 'react';
import type * as LeafletType from 'leaflet';
import { LocateFixed, Maximize2, Minimize2, Target, Navigation } from 'lucide-react';

export interface VehicleMarkerData {
  id: string;
  vehicleId?: string; // ID corresponding to vehicle page (e.g. "veh-ge3797", "veh-1", etc.)
  plateNumber: string;
  label: string; // e.g. "GE 3797-20  LOC" or "GE 3797-20 TRK"
  driverName?: string;
  status: 'moving' | 'idle' | 'parked' | 'offline';
  speedKmh: number;
  courseHeading: number;
  latitude: number;
  longitude: number;
  batteryPercentage: number;
  ignition: boolean;
  imei: string;
  locationLabel: string;
  timestamp?: string;
  trailCoordinates?: Array<[number, number]>;
  isStale?: boolean;
  isTrk?: boolean;
}

export interface PoiMarkerData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  iconType: 'point' | 'poi5';
}

interface TrackingMapProps {
  vehicles: VehicleMarkerData[];
  selectedVehicleId?: string;
  onSelectVehicle?: (vehicle: VehicleMarkerData) => void;
  onVehicleClick?: (vehicle: VehicleMarkerData) => void;
  showTrail?: boolean;
  showGeofences?: boolean;
  mapHeight?: string | number;
  isPlaybackPlaying?: boolean;
  playbackProgress?: number; // 0 to 100
  onSearchSelect?: (item: { name: string; lat: number; lng: number }) => void;
  singleVehicleMode?: boolean;
  fitFleetOnLoad?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isFollowing?: boolean;
  locateRequest?: number;
  focusRequest?: number;
  onLocationRequest?: () => void;
}

export default function TrackingMap({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onVehicleClick,
  showTrail = true,
  showGeofences = true,
  mapHeight = '427px',
  isPlaybackPlaying = false,
  playbackProgress = 0,
  singleVehicleMode = false,
  fitFleetOnLoad = true,
  isExpanded: externalIsExpanded,
  onToggleExpand: externalOnToggleExpand,
  isFollowing = false,
  locateRequest = 0,
  focusRequest = 0,
  onLocationRequest,
}: TrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletType.Map | null>(null);
  const markersRef = useRef<{ [key: string]: LeafletType.Marker }>({});
  const polylineRef = useRef<LeafletType.Polyline | null>(null);
  const geofencePolygonRef = useRef<LeafletType.Polygon | null>(null);
  const geofenceCirclesRef = useRef<LeafletType.Circle[]>([]);
  const baseTileLayerRef = useRef<LeafletType.TileLayer | null>(null);
  const satelliteTileLayerRef = useRef<LeafletType.TileLayer | null>(null);
  const hasFittedFleetRef = useRef(false);

  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalExpanded;

  const [activeTileType, setActiveTileType] = useState<'osm' | 'satellite'>('osm');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Reference track line for GE 3797-20 (Ashaiman to Tema Commercial Corridor)
  const mainTrackCoordinates: [number, number][] = [
    [5.6105, -0.0240], // Corridor start (Ashaiman Interchange)
    [5.6160, -0.0185],
    [5.6210, -0.0140],
    [5.6255, -0.0095], // TRK marker area
    [5.6315, -0.0042],
    [5.6420, -0.0105], // Current LOC marker area
  ];

  // Geofence zone polygon (Blue overlay from user's snippet)
  const geofencePolygonCoords: [number, number][] = [
    [5.6460, -0.0140],
    [5.6480, -0.0050],
    [5.6360, -0.0040],
    [5.6350, -0.0130],
  ];

  // Waypoints and POIs specified in user's snippet
  const poiPoints: PoiMarkerData[] = [
    {
      id: 'poi-1',
      name: 'A way to awash arba',
      latitude: 5.6245,
      longitude: -0.0150,
      iconType: 'point',
    },
    {
      id: 'poi-2',
      name: 'A way to awash arba',
      latitude: 5.6210,
      longitude: -0.0190,
      iconType: 'point',
    },
    {
      id: 'poi-3',
      name: 'oloip',
      latitude: 5.6335,
      longitude: -0.0055,
      iconType: 'poi5',
    },
    {
      id: 'poi-4',
      name: 'Senayan',
      latitude: 5.6130,
      longitude: -0.0210,
      iconType: 'point',
    },
  ];

  // Search locations matching Ghana hubs & user POIs
  const searchableLocations = [
    { name: 'GE 3797-20 (Tema Corridor)', lat: 5.6420, lng: -0.0105, type: 'vehicle' },
    { name: 'GR 4521-22 (Circle Interchange)', lat: 5.5590, lng: -0.2085, type: 'vehicle' },
    { name: 'GT 1892-23 (Mallam Junction)', lat: 5.5680, lng: -0.2780, type: 'vehicle' },
    { name: 'GE 6721-21 (Achimota Terminal)', lat: 5.6120, lng: -0.1980, type: 'vehicle' },
    { name: 'GW 3312-22 (Madina Zongo)', lat: 5.6600, lng: -0.1650, type: 'vehicle' },
    { name: 'GR 2345-22 (Spintex Road)', lat: 5.6200, lng: -0.1150, type: 'vehicle' },
    { name: 'GR 5678-21 (Tetteh Quarshie)', lat: 5.5980, lng: -0.1750, type: 'vehicle' },
    { name: 'Tema Commercial Port', lat: 5.6700, lng: -0.0100, type: 'depot' },
    { name: 'A way to awash arba', lat: 5.6245, lng: -0.0150, type: 'poi' },
    { name: 'oloip', lat: 5.6335, lng: -0.0055, type: 'poi' },
    { name: 'Senayan', lat: 5.6130, lng: -0.0210, type: 'poi' },
  ];

  const filteredLocations = searchableLocations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const toggleExpand = () => {
    if (externalOnToggleExpand) {
      externalOnToggleExpand();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  // Re-invalidate Leaflet map size on expand/collapse
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isExpanded, mapHeight]);

  // Fit bounds helper
  // Fit bounds helper to frame the entire fleet corridor
  const handleFitFleet = () => {
    if (!mapInstanceRef.current || vehicles.length === 0) return;
    import('leaflet').then(L => {
      const validPoints = vehicles.map(v => [v.latitude, v.longitude] as [number, number]);
      if (validPoints.length === 1) {
        mapInstanceRef.current?.flyTo(validPoints[0], 14, { animate: true });
      } else if (validPoints.length > 1) {
        const bounds = L.latLngBounds(validPoints);
        mapInstanceRef.current?.fitBounds(bounds.pad(0.16), { maxZoom: 13, animate: true });
      }
    });
  };

  // Focus on currently selected vehicle helper
  const handleFocusSelected = () => {
    if (!mapInstanceRef.current || !selectedVehicleId) return;
    const selected = vehicles.find(
      v =>
        v.id === selectedVehicleId ||
        v.vehicleId === selectedVehicleId ||
        v.plateNumber === selectedVehicleId ||
        v.id === `marker-${selectedVehicleId}`
    );
    if (selected) {
      mapInstanceRef.current.flyTo([selected.latitude, selected.longitude], 14, { animate: true });
      const marker = markersRef.current[selected.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    let isCancelled = false;

    async function initLeaflet() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = await import('leaflet');

      if (isCancelled || !mapContainerRef.current) return;

      // Fix Leaflet icon paths
      // @ts-expect-error - delete default icon urls
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/img/AngleIcon/2.png',
        iconUrl: '/img/AngleIcon/2.png',
        shadowUrl: '',
      });

      // Frame Greater Accra transit corridor so all markers initialize in-bounds
      const initialCenter: [number, number] = [5.6100, -0.1500];
      const initialZoom = 12;

      const map = L.map('divMap', {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // 1. OpenStreetMap Tile Layer
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: 'Leaflet | Powered by <a href="https://www.esri.com">Esri</a> | © <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
      });
      osmLayer.addTo(map);
      baseTileLayerRef.current = osmLayer;

      // 2. Esri Satellite Tile Layer
      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: 'Tiles &copy; Esri',
        }
      );
      satelliteTileLayerRef.current = satelliteLayer;

      // 3. Zoom Control in Top-Right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // 4. Custom Attribution Control in Bottom-Right
      const CustomAttribution = L.Control.extend({
        onAdd: function () {
          const div = L.DomUtil.create(
            'div',
            'leaflet-control-attribution leaflet-control esri-truncated-attribution'
          );
          div.style.maxWidth = '260px';
          div.innerHTML =
            '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> | Powered by <a href="https://www.esri.com" target="_blank" rel="noreferrer">Esri</a> <span aria-hidden="true">|</span> © <a href="https://osm.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';
          return div;
        },
      });
      new CustomAttribution({ position: 'bottomright' }).addTo(map);

      // 5. SVG Overlay Pane: Green Tracking Path (stroke="#00ff00" stroke-width="3")
      const activeCoords = singleVehicleMode && vehicles[0]?.latitude
        ? [
            [vehicles[0].latitude - 0.015, vehicles[0].longitude - 0.015],
            [vehicles[0].latitude - 0.007, vehicles[0].longitude - 0.008],
            [vehicles[0].latitude, vehicles[0].longitude],
          ] as [number, number][]
        : mainTrackCoordinates;

      const trackPolyline = L.polyline(activeCoords, {
        color: '#00ff00',
        weight: 3,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
      });
      polylineRef.current = trackPolyline;
      if (showTrail) {
        trackPolyline.addTo(map);
      }

      // 6. SVG Overlay Pane: Blue Geofence Path (stroke="#3388ff" stroke-width="3" fill="#0000ff" fill-opacity="0.8")
      const geofencePolygon = L.polygon(geofencePolygonCoords, {
        color: '#3388ff',
        weight: 3,
        opacity: 1,
        fillColor: '#0000ff',
        fillOpacity: 0.35,
        fillRule: 'evenodd',
      });
      geofencePolygonRef.current = geofencePolygon;
      if (showGeofences) {
        geofencePolygon.addTo(map);
      }

      // Add Depot Corridor Circles
      const circle1 = L.circle([5.6420, -0.0105], {
        radius: 650,
        color: '#0B4F6C',
        weight: 1.5,
        dashArray: '4, 4',
        fillColor: '#1B7A9E',
        fillOpacity: 0.12,
      });
      geofenceCirclesRef.current.push(circle1);
      if (showGeofences) {
        circle1.addTo(map);
      }

      // 7. Add POI Markers from snippet (if in fleet overview mode)
      if (!singleVehicleMode) {
        poiPoints.forEach(poi => {
          const imgSrc =
            poi.iconType === 'poi5'
              ? '../img/Monitor/Poi_Icon/5.gif'
              : '../img/Monitor/point.bmp';

          const poiIcon = L.divIcon({
            className: 'OSMdivIcon poi-marker',
            iconSize: [12, 12],
            iconAnchor: [6, 6],
            html: `<img src="${imgSrc}" onerror="this.src='/img/Monitor/${poi.iconType === 'poi5' ? 'Poi_Icon/5.gif' : 'point.bmp'}'" alt="" /><div>${poi.name}</div>`,
          });

          const poiMarker = L.marker([poi.latitude, poi.longitude], {
            icon: poiIcon,
            title: poi.name,
          });
          poiMarker.bindPopup(`
            <div style="font-size: 12px; font-weight: 600; color: #0B4F6C;">
              ${poi.name}
            </div>
            <div style="font-size: 10px; color: #655F59;">
              Coordinates: ${poi.latitude.toFixed(4)}, ${poi.longitude.toFixed(4)}
            </div>
          `);
          poiMarker.addTo(map);
        });
      }

      setMapReady(true);
    }

    initLeaflet();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update vehicle markers when vehicles change or mapReady
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    import('leaflet').then(L => {
      // Clear previous vehicle markers
      Object.values(markersRef.current).forEach(m => m.remove());
      markersRef.current = {};

      const markerCoordinates: [number, number][] = [];

      vehicles.forEach(veh => {
        const isSelected =
          veh.id === selectedVehicleId ||
          veh.vehicleId === selectedVehicleId ||
          veh.plateNumber === selectedVehicleId ||
          (selectedVehicleId ? veh.id === `marker-${selectedVehicleId}` : false);

        const iconSrc = 'https://www.overseetracking.com/img/AngleIcon/2.png';
        const fallbackSrc = '/img/AngleIcon/2.png';

        markerCoordinates.push([veh.latitude, veh.longitude]);

        const markerClass = [
          'OSMdivIcon',
          isSelected ? 'active-vehicle selected-focus-vehicle' : veh.isTrk ? 'track-point' : 'neighbor-vehicle',
          `status-${veh.isStale ? 'offline' : veh.status}`,
        ].join(' ');

        const customDivIcon = L.divIcon({
          className: markerClass,
          iconSize: isSelected ? [22, 22] : [14, 14],
          iconAnchor: isSelected ? [11, 11] : [7, 7],
          html: `
            <div class="${isSelected ? 'selected-pulse-halo' : ''}"></div>
            <img 
              src="${iconSrc}" 
              onerror="this.src='${fallbackSrc}'" 
              style="transform: rotate(${veh.courseHeading || 0}deg);" 
              alt="vehicle-heading" 
            />
            <div>${veh.label}</div>
          `,
        });

        const marker = L.marker([veh.latitude, veh.longitude], {
          icon: customDivIcon,
          zIndexOffset: isSelected ? 3000 : veh.isTrk ? 200 : 800,
        });

        const targetVehicleId = veh.vehicleId || veh.id.replace('marker-', '').replace('-loc', '').replace('-trk', '');

        // Marker taps select the vehicle; navigation stays in the popup link.
        marker.on('click', () => {
          if (onSelectVehicle) {
            onSelectVehicle(veh);
          }
          if (onVehicleClick) {
            onVehicleClick(veh);
          }
        });

        marker.bindPopup(`
          <div style="font-family: inherit; min-width: 185px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <strong style="color: ${isSelected ? '#15803D' : '#0B4F6C'}; font-size: 13px;">${veh.plateNumber}</strong>
              <span style="font-size: 10px; background: ${veh.isStale ? '#E2DFDB' : isSelected ? '#DCFCE7' : '#EDF5F8'}; color: ${veh.isStale ? '#655F59' : isSelected ? '#15803D' : '#0B4F6C'}; padding: 2px 4px; border-radius: 3px; text-transform: uppercase; font-weight: 700;">
                ${veh.isStale ? 'offline' : veh.status}
              </span>
            </div>
            <div style="font-size: 11px; color: #1A1917; margin-bottom: 2px;">
              <strong>Speed:</strong> ${veh.speedKmh} km/h
            </div>
            <div style="font-size: 11px; color: #1A1917; margin-bottom: 2px;">
              <strong>Driver:</strong> ${veh.driverName || 'Unassigned'}
            </div>
            <div style="font-size: 10px; color: #655F59; margin-top: 4px; border-top: 1px solid #E2DFDB; padding-top: 4px;">
              ${veh.locationLabel}
            </div>
            ${
              targetVehicleId
                ? `<div style="margin-top: 8px;">
                     <a 
                       href="/vehicles/${targetVehicleId}" 
                       style="display: block; width: 100%; text-align: center; background: ${isSelected ? '#15803D' : '#0B4F6C'}; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-decoration: none;"
                     >
                       ${isSelected ? 'Current Vehicle Page' : 'Open Dedicated Vehicle Page &rarr;'}
                     </a>
                   </div>`
                : ''
            }
          </div>
        `);

        marker.addTo(map);
        markersRef.current[veh.id] = marker;
      });

      // Fit whole fleet corridor so every marker is inside map bounds and fully clickable
      if (fitFleetOnLoad && !hasFittedFleetRef.current && markerCoordinates.length > 1) {
        const bounds = L.latLngBounds(markerCoordinates);
        map.fitBounds(bounds.pad(0.16), { maxZoom: 13, animate: false });
        hasFittedFleetRef.current = true;
      } else if (fitFleetOnLoad && !hasFittedFleetRef.current && markerCoordinates.length === 1) {
        map.setView(markerCoordinates[0], 13);
        hasFittedFleetRef.current = true;
      }
    });
  }, [vehicles, selectedVehicleId, mapReady, isPlaybackPlaying, onSelectVehicle, onVehicleClick, singleVehicleMode, fitFleetOnLoad]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !isFollowing || !selectedVehicleId) return;
    const selected = vehicles.find(
      vehicle => vehicle.id === selectedVehicleId || vehicle.vehicleId === selectedVehicleId
    );
    if (selected) {
      mapInstanceRef.current.flyTo([selected.latitude, selected.longitude], 15, { animate: true });
    }
  }, [isFollowing, mapReady, selectedVehicleId, vehicles]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || focusRequest === 0 || !selectedVehicleId) return;
    const selected = vehicles.find(
      vehicle => vehicle.id === selectedVehicleId || vehicle.vehicleId === selectedVehicleId
    );
    if (selected) {
      mapInstanceRef.current.flyTo([selected.latitude, selected.longitude], 15, { animate: true });
    }
  }, [focusRequest, mapReady, selectedVehicleId, vehicles]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || locateRequest === 0 || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => mapInstanceRef.current?.flyTo([coords.latitude, coords.longitude], 15, { animate: true }),
      () => undefined,
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }, [locateRequest, mapReady]);

  // Handle Playback animation along track
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !isPlaybackPlaying) return;

    const map = mapInstanceRef.current;
    const progressFraction = Math.min(Math.max(playbackProgress / 100, 0), 1);
    const totalSegments = mainTrackCoordinates.length - 1;
    const currentSegmentIndex = Math.min(
      Math.floor(progressFraction * totalSegments),
      totalSegments - 1
    );
    const segmentProgress = (progressFraction * totalSegments) - currentSegmentIndex;

    const p1 = mainTrackCoordinates[currentSegmentIndex];
    const p2 = mainTrackCoordinates[currentSegmentIndex + 1];

    const currentLat = p1[0] + (p2[0] - p1[0]) * segmentProgress;
    const currentLng = p1[1] + (p2[1] - p1[1]) * segmentProgress;

    // Move active LOC marker
    const locMarker = markersRef.current['veh-ge3797-loc'] || markersRef.current['pos-ge3797'];
    if (locMarker) {
      locMarker.setLatLng([currentLat, currentLng]);
      map.panTo([currentLat, currentLng], { animate: false });
    }
  }, [playbackProgress, isPlaybackPlaying, mapReady]);

  // Toggle the selected vehicle's recorded trail.
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    polylineRef.current?.remove();

    const selected = vehicles.find(
      vehicle => vehicle.id === selectedVehicleId || vehicle.vehicleId === selectedVehicleId
    );
    const coordinates = selected?.trailCoordinates ?? [];
    if (coordinates.length < 2) return;

    import('leaflet').then(L => {
      if (!mapInstanceRef.current) return;
      const trail = L.polyline(coordinates, {
        color: '#18794E',
        weight: 4,
        opacity: 0.82,
        lineCap: 'round',
        lineJoin: 'round',
      });
      polylineRef.current = trail;
      if (showTrail) trail.addTo(mapInstanceRef.current);
    });
  }, [showTrail, mapReady, selectedVehicleId, vehicles]);

  // Toggle Geofences
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (showGeofences) {
      if (geofencePolygonRef.current) geofencePolygonRef.current.addTo(map);
      geofenceCirclesRef.current.forEach(c => c.addTo(map));
    } else {
      if (geofencePolygonRef.current) geofencePolygonRef.current.remove();
      geofenceCirclesRef.current.forEach(c => c.remove());
    }
  }, [showGeofences, mapReady]);

  // Switch Base Map Layer (Street OSM vs Satellite)
  const toggleBaseLayer = (layerType: 'osm' | 'satellite') => {
    if (!mapInstanceRef.current || !baseTileLayerRef.current || !satelliteTileLayerRef.current) return;
    const map = mapInstanceRef.current;

    if (layerType === 'satellite') {
      map.removeLayer(baseTileLayerRef.current);
      satelliteTileLayerRef.current.addTo(map);
      setActiveTileType('satellite');
    } else {
      map.removeLayer(satelliteTileLayerRef.current);
      baseTileLayerRef.current.addTo(map);
      setActiveTileType('osm');
    }
  };

  // Handle Geocoder Search Selection
  const handleLocationSelect = (loc: { name: string; lat: number; lng: number }) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([loc.lat, loc.lng], 16, { animate: true, duration: 1.2 });
    setSearchQuery(loc.name);
    setIsSearchOpen(false);
  };

  return (
    <div
    className="tracking-map-controls"
      style={{
        position: isExpanded ? 'fixed' : 'relative',
        top: isExpanded ? 0 : undefined,
        left: isExpanded ? 0 : undefined,
        right: isExpanded ? 0 : undefined,
        bottom: isExpanded ? 0 : undefined,
        width: isExpanded ? '100vw' : '100%',
        height: isExpanded ? '100vh' : '100%',
        zIndex: isExpanded ? 99999 : undefined,
        display: 'flex',
        flexDirection: 'column',
        background: '#0F2633',
        borderRadius: isExpanded ? 0 : 'var(--pm-radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Top Floating Controls Bar */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 400,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        {/* Layer Switcher */}
        <div
          className="tracking-map-layer-control"
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(6px)',
            borderRadius: 4,
            padding: 2,
            boxShadow: '0 1px 5px rgba(0,0,0,0.25)',
            border: '1px solid rgba(0,0,0,0.1)',
          }}
        >
          <button
            type="button"
            onClick={() => toggleBaseLayer('osm')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: activeTileType === 'osm' ? 700 : 500,
              color: activeTileType === 'osm' ? '#FFFFFF' : '#1A1917',
              background: activeTileType === 'osm' ? '#0B4F6C' : 'transparent',
              border: 'none',
              borderRadius: 3,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Street Map
          </button>
          <button
            type="button"
            onClick={() => toggleBaseLayer('satellite')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: activeTileType === 'satellite' ? 700 : 500,
              color: activeTileType === 'satellite' ? '#FFFFFF' : '#1A1917',
              background: activeTileType === 'satellite' ? '#0B4F6C' : 'transparent',
              border: 'none',
              borderRadius: 3,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Satellite
          </button>
        </div>

        {/* Fit Entire Corridor View button */}
        <button
          type="button"
          onClick={handleFitFleet}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#0B4F6C',
            fontSize: '11px',
            fontWeight: 600,
            padding: '4px 9px',
            borderRadius: 4,
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 1px 5px rgba(0,0,0,0.25)',
            cursor: 'pointer',
          }}
          title="Fit Entire Fleet Corridor"
          aria-label="Fit all vehicles on the map"
          className="tracking-map-fit"
        >
          <Navigation size={13} />
          <span>Fit Corridor</span>
        </button>

        <button
          type="button"
          onClick={onLocationRequest}
          className="tracking-map-locate"
          aria-label="Show my location"
          title="Show my location"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#0B4F6C',
            fontSize: '11px',
            fontWeight: 600,
            padding: '4px 9px',
            borderRadius: 4,
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 1px 5px rgba(0,0,0,0.25)',
            cursor: 'pointer',
          }}
        >
          <LocateFixed size={13} />
          <span>My location</span>
        </button>

        {/* Focus Selected Vehicle button */}
        {selectedVehicleId && (
          <button
            type="button"
            className="tracking-map-focus"
            onClick={handleFocusSelected}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#15803D',
              fontSize: '11px',
              fontWeight: 600,
              padding: '4px 9px',
              borderRadius: 4,
              border: '1px solid rgba(22, 163, 74, 0.3)',
              boxShadow: '0 1px 5px rgba(0,0,0,0.25)',
              cursor: 'pointer',
            }}
            title="Focus on Selected Vehicle"
          >
            <Target size={13} />
            <span>Focus Selected</span>
          </button>
        )}

        {/* Expand / Collapse Map Toggle */}
        <button
          type="button"
          className="tracking-map-expand"
          onClick={toggleExpand}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: isExpanded ? '#0B4F6C' : 'rgba(255, 255, 255, 0.95)',
            color: isExpanded ? '#FFFFFF' : '#0B4F6C',
            fontSize: '11px',
            fontWeight: 600,
            padding: '4px 9px',
            borderRadius: 4,
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 1px 5px rgba(0,0,0,0.25)',
            cursor: 'pointer',
          }}
          title={isExpanded ? 'Collapse Map View' : 'Expand Map Fullscreen'}
        >
          {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          <span>{isExpanded ? 'Collapse Map' : 'Expand Map'}</span>
        </button>

        {/* Live GPS Telematics Badge */}
        <div
          className="tracking-map-live-badge"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(3, 26, 37, 0.88)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 4,
            backdropFilter: 'blur(4px)',
            boxShadow: '0 1px 5px rgba(0,0,0,0.25)',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#2D8A56',
              boxShadow: '0 0 6px #2D8A56',
            }}
          />
          <span>Traccar GPS: Live</span>
        </div>
      </div>

      {/* Geocoder Search Bar Control (Styled exactly as in user's snippet) */}
      {!singleVehicleMode && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 400,
            pointerEvents: 'auto',
          }}
        >
          <div className="geocoder-control leaflet-control">
            <input
              className="geocoder-control-input leaflet-bar"
              title="Location Search"
              placeholder="Location Search"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
            />
            {isSearchOpen && filteredLocations.length > 0 && (
              <div className="geocoder-control-suggestions leaflet-bar">
                {filteredLocations.map((loc, idx) => (
                  <div
                    key={idx}
                    className="geocoder-suggestion-item"
                    onClick={() => handleLocationSelect(loc)}
                  >
                    <span className="geocoder-suggestion-title">{loc.name}</span>
                    <span className="geocoder-suggestion-sub">
                      Lat: {loc.lat.toFixed(4)}, Lng: {loc.lng.toFixed(4)} ({loc.type})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* The Leaflet Container with exact ID from user: id="divMap" */}
      <div
        id="divMap"
        ref={mapContainerRef}
        style={{
          height: isExpanded ? '100%' : mapHeight,
          minHeight: isExpanded ? '100vh' : '380px',
          position: 'relative',
          outlineStyle: 'none',
          flex: 1,
          width: '100%',
        }}
        tabIndex={0}
      />
    </div>
  );
}
