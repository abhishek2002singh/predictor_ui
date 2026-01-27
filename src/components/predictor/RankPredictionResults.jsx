import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  School, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Download,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  Calendar,
  Users,
  Award,
  PieChart,
  User,
  Hash
} from 'lucide-react';
import { fetchRankPrediction, showAllData, setUserDetailsSubmitted } from '../../slice/rankPredictionSlice';
import { toast } from 'react-toastify';

const RankPredictionResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get data from navigation state
  const { 
    collegeName, 
    collegeId,
    counselingType, 
    counselingName,
    collegeType,
    collegeShortName 
  } = location.state || {};

  // Get state from Redux
  const { predictionData, loading, error, showAllData: showAll, userDetailsSubmitted } = useSelector(state => state.rankPrediction);
  
  // State for modal
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // State for filters
  const [selectedFilters, setSelectedFilters] = useState({
    category: 'all',
    gender: 'all',
    seatType: 'all',
    year: 'all',
    round: 'all'
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Fetch data when component mounts
  useEffect(() => {
    if (collegeName && counselingType) {
      const predictionData = {
        institute: collegeName,
        CounselingType: counselingType
      };
      dispatch(fetchRankPrediction(predictionData));
    } else {
      // Redirect back if no data
      navigate('/predict-rank');
    }
  }, [collegeName, counselingType, dispatch, navigate]);

  // Handle "View All" button click
  const handleViewAllClick = () => {
    if (!userDetailsSubmitted) {
      // Show modal for new users
      setShowUserDetailsModal(true);
    } else {
      // Show all data for returning users
      dispatch(showAllData());
      toast.success('Showing all data');
    }
  };

  // Handle user details submission
  const handleSubmitUserDetails = (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    if (!userDetails.firstName.trim()) errors.firstName = 'First name is required';
    if (!userDetails.lastName.trim()) errors.lastName = 'Last name is required';
    if (!userDetails.mobileNumber.trim()) errors.mobileNumber = 'Mobile number is required';
    else if (!/^\d{10}$/.test(userDetails.mobileNumber)) errors.mobileNumber = 'Enter valid 10-digit number';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    console.log('User details submitted:', userDetails);
    
    dispatch(setUserDetailsSubmitted(true));
    dispatch(showAllData());
    
    setShowUserDetailsModal(false);
    setUserDetails({ firstName: '', lastName: '', mobileNumber: '' });
    setFormErrors({});
    
    toast.success('Details submitted successfully! Showing all data.');
  };

  // Handle back to search
  const handleBackToSearch = () => {
    navigate('/predict-rank');
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (collegeName && counselingType) {
      const filterData = {
        institute: collegeName,
        CounselingType: counselingType,
        page: page,
        limit: predictionData?.result?.limit || 20,
        ...selectedFilters
      };
      dispatch(fetchRankPrediction(filterData));
    }
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...selectedFilters,
      [filterType]: value
    };
    setSelectedFilters(newFilters);
    
    // Fetch data with new filters
    if (collegeName && counselingType) {
      const filterData = {
        institute: collegeName,
        CounselingType: counselingType,
        page: 1,
        limit: predictionData?.result?.limit || 20,
        ...newFilters
      };
      dispatch(fetchRankPrediction(filterData));
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedFilters({
      category: 'all',
      gender: 'all',
      seatType: 'all',
      year: 'all',
      round: 'all'
    });
    
    if (collegeName && counselingType) {
      const predictionData = {
        institute: collegeName,
        CounselingType: counselingType
      };
      dispatch(fetchRankPrediction(predictionData));
    }
  };

  // Handle "Show Less" - set showAllData to false
  const handleShowLess = () => {
    dispatch({ type: 'rankPrediction/showAllData', payload: false });
  };

  // Get data to display (4 items initially or all if showAll is true)
  const displayData = () => {
    if (!predictionData || !predictionData.success || !predictionData.result?.data) {
      return [];
    }
    
    const data = predictionData.result.data;
    return showAll ? data : data.slice(0, 4);
  };

  // Calculate statistics
  const calculateStats = () => {
    if (!predictionData || !predictionData.success || !predictionData.result) {
      return null;
    }

    const result = predictionData.result;
    const data = result.data || [];
    
    if (data.length === 0) {
      return null;
    }

    // Use rankRange from API if available, otherwise calculate
    const rankRange = result.rankRange || {
      bestOpeningRank: 0,
      worstClosingRank: 0,
      averageOpeningRank: 0,
      averageClosingRank: 0
    };

    return {
      bestOpeningRank: rankRange.bestOpeningRank || 0,
      worstClosingRank: rankRange.worstClosingRank || 0,
      averageOpeningRank: rankRange.averageOpeningRank || 0,
      averageClosingRank: rankRange.averageClosingRank || 0,
      totalRecords: result.totalRecords || 0,
      currentPage: result.currentPage || 1,
      totalPages: result.totalPages || 1
    };
  };

  const stats = calculateStats();
  const dataToDisplay = displayData();
  const result = predictionData?.result || {};
  const totalRecords = result.totalRecords || 0;
  const currentPage = result.currentPage || 1;
  const totalPages = result.totalPages || 1;
  const hasNextPage = result.hasNextPage || false;
  const hasPrevPage = result.hasPrevPage || false;
  const filters = result.filters || {};
  const statistics = result.statistics || {};

  // Get type color
  const getTypeColor = (type) => {
    switch(type) {
      case 'IIT': return 'bg-red-100 text-red-800 border-red-200';
      case 'NIT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IIIT': return 'bg-green-100 text-green-800 border-green-200';
      case 'GFTI': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    if (category?.includes('PwD')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (category === 'GENERAL') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (category === 'SC') return 'bg-green-100 text-green-800 border-green-200';
    if (category === 'ST') return 'bg-purple-100 text-purple-800 border-purple-200';
    if (category === 'OBC-NCL') return 'bg-orange-100 text-orange-800 border-orange-200';
    if (category === 'EWS') return 'bg-pink-100 text-pink-800 border-pink-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Generate pagination buttons
  const generatePaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    
    // Add first page button
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-gray-700"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis-start" className="px-2 text-gray-500">...</span>
        );
      }
    }
    
    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1.5 border rounded-lg ${
            currentPage === i
              ? 'bg-blue-500 text-white border-blue-500'
              : 'hover:bg-gray-50 text-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Add last page button
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis-end" className="px-2 text-gray-500">...</span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-gray-700"
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToSearch}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors hover:cursor-pointer mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Rank Prediction Results</h1>
              <p className="text-gray-600">Historical cutoff data for {collegeName || 'selected college'}</p>
            </div>
            
            <div className="flex items-center gap-4">
              {collegeType && (
                <span className={`px-4 py-2 rounded-lg border ${getTypeColor(collegeType)}`}>
                  {collegeType}
                </span>
              )}
              {result.counseling && (
                <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg border border-purple-200">
                  {result.counseling}
                </span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Fetching prediction data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-500 mt-1" />
              <div>
                <h3 className="font-bold text-red-700 mb-2">Error Loading Data</h3>
                <p className="text-red-600">{typeof error === 'string' ? error : 'Failed to load data'}</p>
                <button
                  onClick={handleBackToSearch}
                  className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Go Back to Search
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results Section */}
        {!loading && !error && predictionData && predictionData.success && (
          <>
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Best Opening Rank</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.bestOpeningRank?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Worst Closing Rank</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.worstClosingRank?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Avg Opening Rank</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.averageOpeningRank?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <School className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Records</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.totalRecords?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Statistics Section */}
            {statistics && Object.keys(statistics).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg border overflow-hidden mb-8"
              >
                <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-blue-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <PieChart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Statistics</h2>
                      <p className="text-sm text-gray-500">Detailed analysis by category, gender, and year</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* By Category */}
                  {statistics.byCategory && statistics.byCategory.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-600" />
                        By Category
                      </h3>
                      <div className="space-y-3">
                        {statistics.byCategory.slice(0, 5).map((cat, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(cat._id)}`}>
                              {cat._id}
                            </span>
                            <div className="text-right">
                              <div className="font-medium">{cat.count} records</div>
                              <div className="text-xs text-gray-500">
                                Avg: {Math.round(cat.avgOpeningRank).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* By Gender */}
                  {statistics.byGender && statistics.byGender.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600" />
                        By Gender
                      </h3>
                      <div className="space-y-3">
                        {statistics.byGender.map((gender, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium">{gender._id}</span>
                            <div className="text-right">
                              <div className="font-medium">{gender.count} records</div>
                              <div className="text-xs text-gray-500">
                                Avg Rank: {Math.round(gender.avgOpeningRank).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* By Year */}
                  {statistics.byYear && statistics.byYear.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        By Year
                      </h3>
                      <div className="space-y-3">
                        {statistics.byYear.map((year, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium">{year._id}</span>
                            <div className="text-right">
                              <div className="font-medium">{year.count} records</div>
                              <div className="text-xs text-gray-500">
                                Avg: {Math.round(year.avgOpeningRank).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Filter Panel */}
            {filters && Object.keys(filters).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg border overflow-hidden mb-8"
              >
                <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Filter className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                        <p className="text-sm text-gray-500">Filter data by different criteria</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowFilterPanel(!showFilterPanel)}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                      {showFilterPanel ? 'Hide Filters' : 'Show Filters'}
                      <ChevronDown className={`h-4 w-4 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {showFilterPanel && (
                  <div className="p-6 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      {/* Category Filter */}
                      {filters.categories && filters.categories.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                          <select
                            value={selectedFilters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="all">All Categories</option>
                            {filters.categories.map((cat, index) => (
                              <option key={index} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Gender Filter */}
                      {filters.genders && filters.genders.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                          <select
                            value={selectedFilters.gender}
                            onChange={(e) => handleFilterChange('gender', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="all">All Genders</option>
                            {filters.genders.map((gender, index) => (
                              <option key={index} value={gender}>{gender}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Year Filter */}
                      {filters.years && filters.years.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                          <select
                            value={selectedFilters.year}
                            onChange={(e) => handleFilterChange('year', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="all">All Years</option>
                            {filters.years.sort((a, b) => b - a).map((year, index) => (
                              <option key={index} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Round Filter */}
                      {filters.rounds && filters.rounds.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Round</label>
                          <select
                            value={selectedFilters.round}
                            onChange={(e) => handleFilterChange('round', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="all">All Rounds</option>
                            {filters.rounds.sort((a, b) => b - a).map((round, index) => (
                              <option key={index} value={round}>Round {round}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {Object.values(selectedFilters).filter(v => v !== 'all').length > 0 ? (
                          <span>Active filters: {Object.entries(selectedFilters)
                            .filter(([key, value]) => value !== 'all')
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                          </span>
                        ) : (
                          <span>No active filters</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleResetFilters}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg hover:bg-gray-50"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Data Table */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg border overflow-hidden mb-8"
            >
              <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Cutoff Ranks</h2>
                    <p className="text-sm text-gray-500">
                      {showAll ? `Showing page ${currentPage} of ${totalPages}` : `Showing 4 out of ${totalRecords} records`}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {!showAll && totalRecords > 4 && (
                      <button
                        onClick={handleViewAllClick}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <Eye className="h-4 w-4" />
                        View All Data ({totalRecords})
                      </button>
                    )}
                    
                    {showAll && (
                      <button
                        onClick={handleShowLess}
                        className="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium py-2.5 px-5 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <EyeOff className="h-4 w-4" />
                        Show Less
                      </button>
                    )}
                    
                    <button className="flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2.5 px-5 rounded-lg transition-all hover:bg-gray-50">
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Academic Program</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Year</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Round</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Category</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Gender</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Opening Rank</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Closing Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataToDisplay.length > 0 ? (
                      dataToDisplay.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-900 max-w-xs truncate">
                              {item.academicProgramName || 'N/A'}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-900">{item.year || 'N/A'}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                              Round {item.round || 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1.5 text-sm font-medium rounded-lg ${getCategoryColor(item.category)}`}>
                              {item.category || 'General'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                              {item.gender || 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-green-700">
                              {(item.openingRank || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-red-700">
                              {(item.closingRank || 0).toLocaleString()}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-12 text-center">
                          <div className="text-gray-400 mb-3">No data available</div>
                          <p className="text-gray-500">Try selecting different college or counseling type</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Only show when viewing all data */}
              {showAll && totalPages > 1 && (
                <div className="p-6 border-t">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing page {currentPage} of {totalPages} ({result.limit || 20} records per page)
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!hasPrevPage}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg border ${
                          hasPrevPage
                            ? 'hover:bg-gray-50 text-gray-700'
                            : 'opacity-50 cursor-not-allowed text-gray-400'
                        }`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {generatePaginationButtons()}
                      </div>
                      
                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!hasNextPage}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg border ${
                          hasNextPage
                            ? 'hover:bg-gray-50 text-gray-700'
                            : 'opacity-50 cursor-not-allowed text-gray-400'
                        }`}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* View All Button at bottom if not viewing all */}
              {!showAll && totalRecords > 4 && (
                <div className="p-6 border-t bg-gray-50">
                  <div className="text-center">
                    <button
                      onClick={handleViewAllClick}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <Eye className="h-4 w-4" />
                      View Complete Data ({totalRecords} records)
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      View all {totalRecords} records across {totalPages} pages
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* User Details Modal */}
        {showUserDetailsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Get Full Access</h3>
                  <p className="text-gray-600 text-sm">Enter your details to view all data</p>
                </div>
                <button
                  onClick={() => setShowUserDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmitUserDetails}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={userDetails.firstName}
                      onChange={(e) => setUserDetails({...userDetails, firstName: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                        formErrors.firstName ? 'border-red-500' : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                      }`}
                      placeholder="Enter your first name"
                    />
                    {formErrors.firstName && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={userDetails.lastName}
                      onChange={(e) => setUserDetails({...userDetails, lastName: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                        formErrors.lastName ? 'border-red-500' : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                      }`}
                      placeholder="Enter your last name"
                    />
                    {formErrors.lastName && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={userDetails.mobileNumber}
                      onChange={(e) => setUserDetails({...userDetails, mobileNumber: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                        formErrors.mobileNumber ? 'border-red-500' : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                      }`}
                      placeholder="Enter 10-digit mobile number"
                      maxLength="10"
                    />
                    {formErrors.mobileNumber && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.mobileNumber}</p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUserDetailsModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium"
                  >
                    View All Data
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankPredictionResults;