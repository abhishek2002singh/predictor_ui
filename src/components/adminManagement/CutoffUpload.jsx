import React, { useState } from 'react';
import cutoffService from '../../services/cutoffService';
import { toast } from 'react-toastify';

const CutoffUpload = () => {
  const [file, setFile] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [round, setRound] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;
    
    // Basic validation
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to upload data');
      return;
    }

    const formData = new FormData();
    formData.append('csvfile', file);
    formData.append('year', year);
    formData.append('round', round);

    setLoading(true);
    setProgress(0);

    try {
      // Use the service with progress tracking
      const response = await cutoffService.uploadCutoffCSV(formData, setProgress);
      
      if (response.success) {
        toast.success(`✅ Successfully uploaded! Records: ${response.data.total}`);
        setFile(null);
        setProgress(0);
      } else {
        toast.error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Upload Cutoff Data</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Academic Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min="2015"
            max={new Date().getFullYear()}
            className="w-full p-2 border rounded"
            placeholder="e.g., 2024"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">JoSAA Round</label>
          <select
            value={round}
            onChange={(e) => setRound(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Round</option>
            {[1, 2, 3, 4, 5, 6, 7].map(r => (
              <option key={r} value={r}>Round {r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">CSV File</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <div className="space-y-2">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <p className="text-sm text-gray-600">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500">CSV files only (max 10MB)</p>
              </div>
            </label>
          </div>
          
          {file && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">
                  ✅ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {progress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            'Upload CSV'
          )}
        </button>

        {/* Upload instructions */}
        <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
          <p className="font-medium mb-1">CSV Format:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Required columns: <code>Institute</code>, <code>Academic Program Name</code>, <code>Seat Type</code>, <code>Gender</code>, <code>Opening Rank</code>, <code>Closing Rank</code></li>
            <li>First row should contain column headers</li>
            <li>Example: <code>Indian Institute of Technology Delhi,Computer Science,OPEN,Gender-Neutral,100,500</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CutoffUpload;