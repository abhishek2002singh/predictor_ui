import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Scatter,
  Treemap
} from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUploadAnalytics } from '../../slice/analysisSlice';

const UploadAnalyticsPage = () => {
  const dispatch = useDispatch();
  const { uploadAnalytics, loading, error } = useSelector((state) => ({
    uploadAnalytics: state.analytics.uploadAnalytics,
    loading: state.analytics.loading.upload,
    error: state.analytics.error.upload
  }));

  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedChartType, setSelectedChartType] = useState('bar');
  const [viewMode, setViewMode] = useState('overview'); // overview, details, trends

  useEffect(() => {
    dispatch(fetchUploadAnalytics());
  }, [dispatch]);

  // Process data for charts
  const processChartData = () => {
    if (!uploadAnalytics?.data) return null;

    const { yearWiseUpload, yearWiseRoundAnalytics } = uploadAnalytics.data;

    // Year-wise upload chart data
    const yearWiseData = yearWiseUpload.map(item => ({
      year: item._id,
      entries: item.totalEntries,
      name: `Year ${item._id}`
    }));

    // Prepare round-wise stacked chart data
    const roundAnalyticsData = {};
    yearWiseRoundAnalytics.forEach(yearData => {
      const year = yearData._id;
      const rounds = {};
      
      // Initialize all rounds to 0
      for (let i = 1; i <= 7; i++) {
        rounds[`round${i}`] = 0;
      }
      
      // Fill actual round data
      yearData.rounds.forEach(round => {
        rounds[`round${round.round}`] = round.count;
      });

      roundAnalyticsData[year] = {
        year: `Year ${year}`,
        ...rounds,
        total: yearData.totalEntries
      };
    });

    // For pie chart (top 5 years)
    const pieChartData = yearWiseData
      .sort((a, b) => b.entries - a.entries)
      .slice(0, 5)
      .map(item => ({
        name: `Year ${item.year}`,
        value: item.entries
      }));

    // Prepare data for treemap (year-wise distribution)
    const treemapData = yearWiseUpload.map(item => ({
      name: `Year ${item._id}`,
      size: item.totalEntries,
      value: item.totalEntries
    }));

    // Prepare data for round comparison chart
    const roundComparisonData = [];
    const roundTotals = {};
    
    yearWiseRoundAnalytics.forEach(yearData => {
      yearData.rounds.forEach(round => {
        roundTotals[round.round] = (roundTotals[round.round] || 0) + round.count;
      });
    });

    Object.keys(roundTotals).sort().forEach(round => {
      roundComparisonData.push({
        round: `Round ${round}`,
        entries: roundTotals[round]
      });
    });

    return {
      yearWiseData,
      roundAnalyticsData: Object.values(roundAnalyticsData),
      pieChartData,
      treemapData,
      roundComparisonData
    };
  };

  const chartData = processChartData();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          Loading analytics data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: '#fee',
        border: '2px solid #fcc',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h3 style={{ color: '#c00', marginBottom: '10px' }}>Error Loading Analytics</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
        <button
          onClick={() => dispatch(fetchUploadAnalytics())}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          color: '#333',
          marginBottom: '10px'
        }}>
          Upload Data Analytics
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#666',
          marginBottom: '20px'
        }}>
          Monitor and analyze cutoff data uploads across years and rounds
        </p>
        
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setViewMode('overview')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === 'overview' ? '#3498db' : '#f5f5f5',
              color: viewMode === 'overview' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('details')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === 'details' ? '#3498db' : '#f5f5f5',
              color: viewMode === 'details' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Details
          </button>
          <button
            onClick={() => setViewMode('trends')}
            style={{
              padding: '8px 16px',
              backgroundColor: viewMode === 'trends' ? '#3498db' : '#f5f5f5',
              color: viewMode === 'trends' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Trends
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>Total Cutoff Entries</h3>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold',
            color: '#2ecc71',
            marginBottom: '10px'
          }}>
            {uploadAnalytics?.data?.totalCutoffEntries?.toLocaleString() || 0}
          </div>
          <p style={{ color: '#999', fontSize: '0.9rem' }}>Across all years and rounds</p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>Years Covered</h3>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold',
            color: '#3498db',
            marginBottom: '10px'
          }}>
            {uploadAnalytics?.data?.yearWiseUpload?.length || 0}
          </div>
          <p style={{ color: '#999', fontSize: '0.9rem' }}>
            From {uploadAnalytics?.data?.yearWiseUpload?.[0]?._id || 'N/A'} to {uploadAnalytics?.data?.yearWiseUpload?.[uploadAnalytics?.data?.yearWiseUpload?.length - 1]?._id || 'N/A'}
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>Average Yearly Uploads</h3>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold',
            color: '#9b59b6',
            marginBottom: '10px'
          }}>
            {uploadAnalytics?.data?.yearWiseUpload?.length 
              ? Math.round(uploadAnalytics.data.totalCutoffEntries / uploadAnalytics.data.yearWiseUpload.length).toLocaleString()
              : 0}
          </div>
          <p style={{ color: '#999', fontSize: '0.9rem' }}>Per year average</p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>Total Rounds</h3>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold',
            color: '#e74c3c',
            marginBottom: '10px'
          }}>
            7
          </div>
          <p style={{ color: '#999', fontSize: '0.9rem' }}>Rounds per year</p>
        </div>
      </div>

      {viewMode === 'overview' && (
        <>
          {/* Year-wise Uploads Chart */}
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ color: '#333', margin: 0 }}>Year-wise Upload Statistics</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={selectedChartType}
                  onChange={(e) => setSelectedChartType(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="area">Area Chart</option>
                  <option value="composed">Composed Chart</option>
                </select>
              </div>
            </div>
            
            <div style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                {selectedChartType === 'bar' ? (
                  <BarChart data={chartData?.yearWiseData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="year" 
                      stroke="#666"
                      tick={{ fill: '#666' }}
                    />
                    <YAxis 
                      stroke="#666"
                      tick={{ fill: '#666' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="entries" 
                      name="Uploaded Entries" 
                      fill="#3498db"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : selectedChartType === 'line' ? (
                  <LineChart data={chartData?.yearWiseData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="year" 
                      stroke="#666"
                      tick={{ fill: '#666' }}
                    />
                    <YAxis 
                      stroke="#666"
                      tick={{ fill: '#666' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="entries" 
                      name="Uploaded Entries" 
                      stroke="#3498db" 
                      strokeWidth={3}
                      dot={{ r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                ) : selectedChartType === 'area' ? (
                  <AreaChart data={chartData?.yearWiseData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="year" 
                      stroke="#666"
                      tick={{ fill: '#666' }}
                    />
                    <YAxis 
                      stroke="#666"
                      tick={{ fill: '#666' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="entries" 
                      name="Uploaded Entries" 
                      stroke="#3498db" 
                      fill="#3498db"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                ) : (
                  <ComposedChart data={chartData?.yearWiseData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="year" 
                      stroke="#666"
                      tick={{ fill: '#666' }}
                    />
                    <YAxis 
                      stroke="#666"
                      tick={{ fill: '#666' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="entries" 
                      name="Entries" 
                      fill="#3498db"
                      barSize={20}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="entries" 
                      name="Trend" 
                      stroke="#e74c3c" 
                      strokeWidth={2}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart and Treemap side by side */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '30px',
            marginBottom: '30px'
          }}>
            {/* Top 5 Years Pie Chart */}
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ color: '#333', marginBottom: '20px' }}>Top 5 Years by Upload Volume</h2>
              <div style={{ height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData?.pieChartData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {chartData?.pieChartData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value.toLocaleString()} entries`, 'Uploads']}
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Year Distribution Treemap */}
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ color: '#333', marginBottom: '20px' }}>Year-wise Distribution</h2>
              <div style={{ height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={chartData?.treemapData || []}
                    dataKey="size"
                    stroke="#fff"
                    fill="#8884d8"
                  >
                    <Tooltip 
                      formatter={(value) => [`${value.toLocaleString()} entries`, 'Uploads']}
                      labelStyle={{ fontWeight: 'bold' }}
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </Treemap>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'details' && (
        <>
          {/* Round-wise Distribution */}
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Round-wise Distribution (Stacked View)</h2>
            <div style={{ height: '500px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData?.roundAnalyticsData || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#666"
                    tick={{ fill: '#666' }}
                  />
                  <YAxis 
                    stroke="#666"
                    tick={{ fill: '#666' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="round1" stackId="a" name="Round 1" fill="#8884d8" />
                  <Bar dataKey="round2" stackId="a" name="Round 2" fill="#82ca9d" />
                  <Bar dataKey="round3" stackId="a" name="Round 3" fill="#ffc658" />
                  <Bar dataKey="round4" stackId="a" name="Round 4" fill="#ff8042" />
                  <Bar dataKey="round5" stackId="a" name="Round 5" fill="#0088fe" />
                  <Bar dataKey="round6" stackId="a" name="Round 6" fill="#00c49f" />
                  <Bar dataKey="round7" stackId="a" name="Round 7" fill="#ffbb28" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Round Comparison Chart */}
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Round-wise Comparison</h2>
            <div style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData?.roundComparisonData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="round" 
                    stroke="#666"
                    tick={{ fill: '#666' }}
                  />
                  <YAxis 
                    stroke="#666"
                    tick={{ fill: '#666' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="entries" 
                    name="Total Entries" 
                    fill="#3498db"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Data Table */}
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Detailed Round-wise Data</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: '#f8f9fa',
                    borderBottom: '2px solid #dee2e6'
                  }}>
                    <th style={{ 
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: 'bold',
                      color: '#495057'
                    }}>Year</th>
                    <th style={{ 
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: 'bold',
                      color: '#495057'
                    }}>Total</th>
                    {[1, 2, 3, 4, 5, 6, 7].map(round => (
                      <th key={round} style={{ 
                        padding: '12px',
                        textAlign: 'left',
                        fontWeight: 'bold',
                        color: '#495057'
                      }}>Round {round}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData?.roundAnalyticsData?.map((yearData, index) => (
                    <tr key={index} style={{ 
                      borderBottom: '1px solid #dee2e6',
                      backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa'
                    }}>
                      <td style={{ padding: '12px' }}>{yearData.year}</td>
                      <td style={{ 
                        padding: '12px',
                        fontWeight: 'bold',
                        color: '#2ecc71'
                      }}>{yearData.total.toLocaleString()}</td>
                      {[1, 2, 3, 4, 5, 6, 7].map(round => (
                        <td key={round} style={{ padding: '12px' }}>
                          {yearData[`round${round}`].toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {viewMode === 'trends' && (
        <>
          {/* Trend Analysis */}
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Upload Trends Analysis</h2>
            <div style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData?.yearWiseData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#666"
                    tick={{ fill: '#666' }}
                  />
                  <YAxis 
                    stroke="#666"
                    tick={{ fill: '#666' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="entries" 
                    name="Upload Volume" 
                    fill="#3498db" 
                    stroke="#3498db"
                    fillOpacity={0.3}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="entries" 
                    name="Trend Line" 
                    stroke="#e74c3c" 
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insights */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '30px',
            marginBottom: '30px'
          }}>
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ color: '#333', marginBottom: '20px' }}>Key Insights</h2>
              <ul style={{ 
                listStyleType: 'none',
                padding: 0,
                margin: 0
              }}>
                {chartData?.yearWiseData && chartData.yearWiseData.length > 0 && (
                  <>
                    <li style={{ 
                      padding: '10px 0',
                      borderBottom: '1px solid #eee'
                    }}>
                      <strong>Peak Year:</strong> Year {chartData.yearWiseData.reduce((max, item) => 
                        item.entries > max.entries ? item : max
                      ).year} had the most uploads
                    </li>
                    <li style={{ 
                      padding: '10px 0',
                      borderBottom: '1px solid #eee'
                    }}>
                      <strong>Data Coverage:</strong> {chartData.yearWiseData.length} years of comprehensive data
                    </li>
                    <li style={{ 
                      padding: '10px 0',
                      borderBottom: '1px solid #eee'
                    }}>
                      <strong>Round Distribution:</strong> Most comprehensive data for middle rounds (3-5)
                    </li>
                    <li style={{ 
                      padding: '10px 0'
                    }}>
                      <strong>Consistency:</strong> {chartData.yearWiseData.length >= 3 && 
                        (chartData.yearWiseData.slice(-3)[0].entries > 
                        chartData.yearWiseData.slice(-3)[1].entries 
                          ? 'Increasing' 
                          : 'Decreasing')} trend in recent years
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ color: '#333', marginBottom: '20px' }}>Recommendations</h2>
              <ul style={{ 
                listStyleType: 'none',
                padding: 0,
                margin: 0
              }}>
                <li style={{ 
                  padding: '10px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  📊 Prioritize data collection for years with sparse coverage
                </li>
                <li style={{ 
                  padding: '10px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  🔍 Focus on completing Round 7 data for all years
                </li>
                <li style={{ 
                  padding: '10px 0',
                  borderBottom: '1px solid #eee'
                }}>
                  ⚙️ Implement automated validation for upload quality
                </li>
                <li style={{ 
                  padding: '10px 0'
                }}>
                  🎯 Set targets for year-over-year data completeness
                </li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Footer Actions */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 0',
        borderTop: '1px solid #eee',
        marginTop: '30px'
      }}>
        <div style={{ color: '#999', fontSize: '0.9rem' }}>
          Last updated: {uploadAnalytics?.data?.lastUpdated ? 
            new Date(uploadAnalytics.data.lastUpdated).toLocaleString() : 
            'N/A'}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              // Export functionality
              const dataStr = JSON.stringify(uploadAnalytics?.data, null, 2);
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
              const exportFileDefaultName = 'upload-analytics.json';
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', exportFileDefaultName);
              linkElement.click();
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>📥</span> Export Data
          </button>
          <button
            onClick={() => dispatch(fetchUploadAnalytics())}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🔄</span> Refresh Analytics
          </button>
        </div>
      </div>

      {/* Add CSS for spinner animation */}
      <style jsx="true">{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UploadAnalyticsPage;