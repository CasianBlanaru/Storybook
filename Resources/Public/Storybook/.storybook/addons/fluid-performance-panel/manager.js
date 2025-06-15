import { addons, types } from '@storybook/manager-api';
import { AddonPanel } from '@storybook/components';
import React, { useState, useEffect } from 'react';

const ADDON_ID = 'fluid-performance';
const PANEL_ID = `${ADDON_ID}/panel`;

// Performance Panel Component
const PerformancePanel = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [isCollecting, setIsCollecting] = useState(false);

  useEffect(() => {
    // Listen for performance data from the preview iframe
    const handleMessage = (event) => {
      if (event.data.type === 'FLUID_PERFORMANCE_UPDATE') {
        setPerformanceData(prev => [...prev, event.data.payload].slice(-50)); // Keep last 50 entries
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const toggleCollection = () => {
    setIsCollecting(!isCollecting);
    // Send message to preview iframe to start/stop collection
    window.postMessage({
      type: 'FLUID_PERFORMANCE_TOGGLE',
      payload: { collecting: !isCollecting }
    }, '*');
  };

  const clearData = () => {
    setPerformanceData([]);
  };

  const averageRenderTime = performanceData.length > 0 
    ? (performanceData.reduce((sum, item) => sum + item.renderTime, 0) / performanceData.length).toFixed(2)
    : 0;

  return React.createElement('div', { style: { padding: '16px' } }, [
    React.createElement('div', { 
      key: 'header',
      style: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px',
        borderBottom: '1px solid #eee',
        paddingBottom: '8px'
      }
    }, [
      React.createElement('h3', { key: 'title', style: { margin: 0 } }, 'Fluid Template Performance'),
      React.createElement('div', { key: 'controls' }, [
        React.createElement('button', {
          key: 'toggle',
          onClick: toggleCollection,
          style: {
            marginRight: '8px',
            padding: '4px 8px',
            backgroundColor: isCollecting ? '#ff4d4f' : '#52c41a',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }
        }, isCollecting ? 'Stop' : 'Start'),
        React.createElement('button', {
          key: 'clear',
          onClick: clearData,
          style: {
            padding: '4px 8px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }
        }, 'Clear')
      ])
    ]),
    
    React.createElement('div', { 
      key: 'stats',
      style: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '16px',
        marginBottom: '16px'
      }
    }, [
      React.createElement('div', { key: 'total', style: { textAlign: 'center' } }, [
        React.createElement('div', { key: 'label', style: { fontSize: '12px', color: '#666' } }, 'Total Requests'),
        React.createElement('div', { key: 'value', style: { fontSize: '20px', fontWeight: 'bold' } }, performanceData.length)
      ]),
      React.createElement('div', { key: 'avg', style: { textAlign: 'center' } }, [
        React.createElement('div', { key: 'label', style: { fontSize: '12px', color: '#666' } }, 'Avg Render Time'),
        React.createElement('div', { key: 'value', style: { fontSize: '20px', fontWeight: 'bold' } }, `${averageRenderTime}ms`)
      ]),
      React.createElement('div', { key: 'status', style: { textAlign: 'center' } }, [
        React.createElement('div', { key: 'label', style: { fontSize: '12px', color: '#666' } }, 'Status'),
        React.createElement('div', { 
          key: 'value', 
          style: { 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: isCollecting ? '#52c41a' : '#666'
          } 
        }, isCollecting ? 'Collecting' : 'Stopped')
      ])
    ]),

    React.createElement('div', { 
      key: 'data',
      style: { 
        maxHeight: '300px', 
        overflowY: 'auto',
        border: '1px solid #eee',
        borderRadius: '4px'
      }
    }, 
      performanceData.length === 0 
        ? React.createElement('div', { 
            style: { 
              padding: '20px', 
              textAlign: 'center', 
              color: '#666' 
            } 
          }, 'No performance data collected yet. Click "Start" to begin monitoring.')
        : performanceData.slice().reverse().map((item, index) => 
            React.createElement('div', {
              key: index,
              style: {
                padding: '8px 12px',
                borderBottom: index < performanceData.length - 1 ? '1px solid #f0f0f0' : 'none',
                fontSize: '12px'
              }
            }, [
              React.createElement('div', { key: 'template', style: { fontWeight: 'bold' } }, item.templatePath),
              React.createElement('div', { 
                key: 'details',
                style: { 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginTop: '4px',
                  color: '#666'
                }
              }, [
                React.createElement('span', { key: 'time' }, `${item.renderTime}ms`),
                React.createElement('span', { key: 'size' }, `${item.contentLength} bytes`),
                React.createElement('span', { key: 'vars' }, `${item.variableCount} vars`),
                React.createElement('span', { key: 'timestamp' }, new Date(item.timestamp).toLocaleTimeString())
              ])
            ])
          )
    )
  ]);
};

// Register the addon
addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Performance',
    match: ({ viewMode }) => viewMode === 'story',
    render: ({ active }) => {
      return React.createElement(AddonPanel, { active }, React.createElement(PerformancePanel));
    },
  });
}); 