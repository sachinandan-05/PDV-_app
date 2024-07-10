import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Fill, Stroke, Text } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import { Coordinate } from 'ol/coordinate';
import { MapBrowserEvent } from 'ol';
import Chart from 'chart.js/auto';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import toast from 'react-hot-toast';
import { IoIosSearch } from "react-icons/io";


interface FeatureProperties {
  density: number;
  name: string;
}

const getColor = (density: number): string => {
  return density > 1000
    ? '#800026'
    : density > 500
      ? '#BD0026'
      : density > 200
        ? '#E31A1C'
        : density > 100
          ? '#FC4E2A'
          : density > 50
            ? '#FD8D3C'
            : density > 20
              ? '#FEB24C'
              : density > 10
                ? '#FED976'
                : '#FFEDA0';
};

const styleFunction = (feature: Feature<Geometry>): Style => {
  const properties = feature.getProperties() as FeatureProperties;
  const density = properties.density;
  const name = properties.name;
  return new Style({
    fill: new Fill({
      color: getColor(density),
    }),
    stroke: new Stroke({
      color: '#18073b',
      width: 1,
    }),
    text: new Text({
      text: name,
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: '#000',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
  });
};

const MapComponent: React.FC = () => {
  const mapRef = useRef<Map | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [features, setFeatures] = useState<Feature<Geometry>[]>([]);

  useEffect(() => {
    const fetchDataAndInitializeMap = async () => {
      try {
        const response = await fetch('https://openlayers.org/data/vector/us-states.json');
        const geojsonObject = await response.json();

        const vectorSource = new VectorSource({
          features: new GeoJSON().readFeatures(geojsonObject, {
            featureProjection: 'EPSG:3857',
          }),
        });

        setFeatures(vectorSource.getFeatures() as Feature<Geometry>[]);

        const vectorLayer = new VectorLayer({
          source: vectorSource,
          style: styleFunction,
        });

        const map = new Map({
          target: 'vectorLayerMap',
          layers: [
            new TileLayer({
              source: new XYZ({
                url: `https://api.maptiler.com/maps/darkmatter/256/{z}/{x}/{y}.png?key=3XrRgAtLV9LMhmU55aGK`,
              }),
            }),
            vectorLayer,
          ],
          view: new View({
            center: fromLonLat([-95.7129, 37.0902]),
            zoom: 4,
          }),
        });

        mapRef.current = map;

        map.on('pointermove', handlePointerMove);

        return () => {
          map.setTarget(undefined);
        };
      } catch (error) {
     
        console.error('Error fetching GeoJSON data:', error);
      }
    };

    fetchDataAndInitializeMap();
  }, []);

  const handlePointerMove = (event: MapBrowserEvent<UIEvent>) => {
    if (mapRef.current) {
      const map = mapRef.current;
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature) as Feature<Geometry> | null;
      if (feature) {
        const properties = feature.getProperties() as FeatureProperties;
        const density = properties.density;
        const name = properties.name;
        if (density !== undefined && name) {
          const coordinate: Coordinate = event.coordinate;
          showTooltip(`${name} population density: ${density}`, coordinate);
          updateChart(name, density);
        } else {
          hideTooltip();
        }
      } else {
        hideTooltip();
      }
    }
  };

  const showTooltip = (text: string, coordinate: Coordinate) => {
    if (tooltipRef.current) {
      tooltipRef.current.innerHTML = text;
      tooltipRef.current.style.display = 'block';
      const overlay = new Overlay({
        element: tooltipRef.current,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -15],
      });
      if (mapRef.current) {
        mapRef.current.addOverlay(overlay);
        overlay.setPosition(coordinate);
      }
    }
  };

  const hideTooltip = () => {
    const overlay = mapRef.current?.getOverlays().getArray()[0];
    if (overlay) {
      mapRef.current?.removeOverlay(overlay);
      if (tooltipRef.current) {
        tooltipRef.current.style.display = 'none';
      }
    }
  };

  const initializeChart = () => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx && !chartInstanceRef.current) {
        chartInstanceRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: [],
            datasets: [
              {
                label: 'Population Density',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: true,
              },
              title: {
                display: true,
                text: 'Population Density Chart',
              },
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: 'State',
                },
              },
              y: {
                display: true,
                title: {
                  display: true,
                  text: 'Density',
                },
              },
            },
          },
        });
      }
    }
  };

  const updateChart = (name: string, density: number) => {
    if (chartInstanceRef.current) {
      const chart = chartInstanceRef.current;
      chart.data.labels = [name];
      chart.data.datasets[0].data = [density];
      chart.update();
    } else {
      initializeChart();
    }
  };

  const handleSearch = () => {
    const feature = features.find(f => (f.get('name') as string).toLowerCase() === searchQuery.toLowerCase());
    if (feature) {
      const geometry = feature.getGeometry();
      if (geometry) {
        const coordinates = toLonLat(geometry.getFirstCoordinate() as Coordinate);
        mapRef.current?.getView().animate({
          center: fromLonLat(coordinates),
          zoom: 8,
        });
      }
    } else {
     toast.error("city not found !!")
    }
  };

  useEffect(() => {
    initializeChart();
  }, []);

  return (
    <div className="relative h-screen lg:flex lg:flex-col lg:items-stretch lg:justify-start">
       
      <div className="absolute top-10 left-10 lg:left-[40%] lg:p-4 bg-[#16164577] text-white rounded-fu shadow-lg border-2 border-white z-50">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter city name"
          className="p-2 h-8 rounded-full bg-[#fff]  text-black w-full"
        />
        <button
          onClick={handleSearch}
          className="p-2  hover:bg-slate-500 rounded-r-full h-8  absolute lg:right-2 right-[2px] lg:mr-2  bg-slate-400  text-white"
        >
         <IoIosSearch className='text-blue-700' size={18} />
        </button>
      </div>
      <div id="vectorLayerMap" className="w-full relative h-[50%] lg:h-screen z-30 border-2 border-white"></div>
      <div className=''>
     
      <div className=" relative lg:absolute lg:block top-10 pl-3 right-10 lg:right-10  lg:z-[999999] lg:top-20 p-4 lg:bg-[#16164577] bg-blue-950 text-white rounded shadow-lg border-2 md:w-18 md:pl-3 border-white hidden">
        <h4 className="font-bold mb-2 text-center">Population Density Legend</h4>
        <div className="flex flex-col lg:items-start items-start m-10 lg:m-1   ">
          <div className="flex lg:items-center   ">
            <span className="inline-block w-4 h-4 mr-2" style={{ backgroundColor: '#800026' }}></span> &gt; 1000
          </div>
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 mr-2" style={{ backgroundColor: '#BD0026' }}></span> 500 - 1000
          </div>
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 mr-2" style={{ backgroundColor: '#E31A1C' }}></span> 200 - 500
          </div>
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 mr-2" style={{ backgroundColor: '#FC4E2A' }}></span> 100 - 200
          </div>
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 mr-2" style={{ backgroundColor: '#FD8D3C' }}></span> 50 - 100
          </div>
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 mr-2" style={{ backgroundColor: '#FEB24C' }}></span> 20 - 50
          </div>
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 mr-2" style={{ backgroundColor: '#FED976' }}></span> 10 - 20
          </div>
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 mr-2" style={{ backgroundColor: '#FFEDA0' }}></span> &lt; 10
          </div>
        </div>
      </div>
      {/* for mobile */}
      <div className="m-1 lg:hidden top-10 right-10    bg-blue-950 text-white rounded shadow-lg border-2 md:w-18 border-white">
  <h4 className="font-bold  text-center">Population Density Legend</h4>
  <div className="flex flex-wrap lg:flex-col lg:items-start items-center m-10 lg:m-1 space-x-4 lg:space-x-0 lg:space-y-4">
    <div className="flex items-center">
      <span className="inline-block w-4 h-4 mr-2" style={{ backgroundColor: '#800026' }}></span> &gt; 1000
    </div>
    <div className="flex items-center">
      <span className="inline-block w-4 h-4 mr-2" style={{ backgroundColor: '#BD0026' }}></span> 500 - 1000
    </div>
    <div className="flex items-center">
      <span className="inline-block w-4 h-4 mr-2" style={{ backgroundColor: '#E31A1C' }}></span> 200 - 500
    </div>
    <div className="flex items-center">
      <span className="inline-block w-4 h-4 mr-2" style={{ backgroundColor: '#FC4E2A' }}></span> 100 - 200
    </div>
    <div className="flex items-center">
      <span className="inline-block w-4 h-4 mr-2" style={{ backgroundColor: '#FD8D3C' }}></span> 50 - 100
    </div>
    <div className="flex items-center">
      <span className="inline-block w-4 h-4 mr-2" style={{ backgroundColor: '#FEB24C' }}></span> 20 - 50
    </div>
    <div className="flex items-center">
      <span className="inline-block w-4 h-4 mr-2" style={{ backgroundColor: '#FED976' }}></span> 10 - 20
    </div>
    <div className="flex items-center">
      <span className="inline-block w-4 h-4 mr-2" style={{ backgroundColor: '#FFEDA0' }}></span> &lt; 10
    </div>
  </div>
</div>
      </div>
      
      <div
        ref={tooltipRef}
        className="tooltip font-sans font-semibold cursor-pointer border-2 border-white"
        style={{
          display: 'none',
          backgroundColor: 'rgba(16, 4, 4, 0.5)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          position: 'absolute',
          zIndex: 999,
        }}
      ></div>
      <div className="relative hidden lg:block bottom-20 left-10 lg:z-[777] lg:absolute lg:bottom-20 lg:left-10 lg:w-[30%] lg:h-[30%] bg-[#16164577] text-white rounded shadow-lg border-2 border-white p-4">
        <canvas ref={chartRef} style={{ width: '100%', height: '100%' }}></canvas>
      </div>
    </div>
  );
};

export default MapComponent;
