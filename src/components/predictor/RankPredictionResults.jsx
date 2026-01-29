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
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  PieChart,
  X
} from 'lucide-react';
import { 
  fetchRankPrediction, 
  showAllData, 
  setUserDetailsSubmitted,
  submitUserDetails  // ADDED
} from '../../slice/rankPredictionSlice';
import { toast } from 'react-toastify';
import FilterModal from '../../modal/FilterModal'; 
import RankPredictionShimmer from '../shimmer/RankPredictionShimmer';

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

  // Get state from Redux - UPDATED
  const { 
    predictionData, 
    loading, 
    error, 
    showAllData: showAll, 
    userDetailsSubmitted,
    submitLoading,
    submitError
  } = useSelector(state => state.rankPrediction);
  
  // State for modal
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    emailId: ''
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
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      navigate(-1);
    }
  }, [collegeName, counselingType, dispatch, navigate]);

  // Show error toast if submit fails
  useEffect(() => {
    if (submitError) {
      toast.error(submitError || 'Failed to submit details');
    }
  }, [submitError]);

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

  // Handle user details submission - UPDATED
  const handleSubmitUserDetails = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    if (!userDetails.firstName.trim()) errors.firstName = 'First name is required';
    if (!userDetails.lastName.trim()) errors.lastName = 'Last name is required';
    if (!userDetails.emailId?.trim()) {
      errors.emailId = "Email is required";
    }
    if (!userDetails.mobileNumber.trim()) errors.mobileNumber = 'Mobile number is required';
    else if (!/^\d{10}$/.test(userDetails.mobileNumber)) errors.mobileNumber = 'Enter valid 10-digit number';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // Create the payload for the API
      const userDataPayload = {
        mobileNumber: userDetails.mobileNumber,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        emailId: userDetails.emailId,
        
      };

      // Dispatch the API call
      const result = await dispatch(submitUserDetails(userDataPayload)).unwrap();
      
      // If successful, show all data
      dispatch(setUserDetailsSubmitted(true));
      dispatch(showAllData());
      
      setShowUserDetailsModal(false);
      setUserDetails({ 
        firstName: '', 
        lastName: '', 
        mobileNumber: '',
        emailId: '' 
      });
      setFormErrors({});
      
      toast.success('Details submitted successfully! Showing all data.');
      
    } catch (error) {
      // Error is already handled by Redux, but you can add additional handling
      console.error('Failed to submit user details:', error);
    }
  };

  // Handle back to search
  const handleBackToSearch = () => {
    navigate(-1);
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
    
    // Create payload with correct parameter names
    const payload = {
      institute: collegeName,
      CounselingType: counselingType,
      ...(value !== 'all' && { [filterType]: value })
    };
    
    dispatch(fetchRankPrediction(payload));
  };

  // Apply all filters
  const handleApplyFilters = () => {
    const activeFilters = {};
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (value !== 'all') {
        activeFilters[key] = value;
      }
    });

    const filterData = {
      institute: collegeName,
      CounselingType: counselingType,
      ...activeFilters
    };
    
    dispatch(fetchRankPrediction(filterData));
    setShowFilterModal(false);
    toast.success('Filters applied successfully');
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
    
    const predictionData = {
      institute: collegeName,
      CounselingType: counselingType
    };
    dispatch(fetchRankPrediction(predictionData));
    toast.success('Filters reset successfully');
  };

  // Filter data based on search query
  const filterDataBySearch = (data) => {
    if (!searchQuery.trim()) return data;
    
    return data.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (item.academicProgramName?.toLowerCase().includes(searchLower)) ||
        (item.category?.toLowerCase().includes(searchLower)) ||
        (item.year?.toString().includes(searchQuery)) ||
        (item.round?.toString().includes(searchQuery))
      );
    });
  };

  // Get data to display
  const displayData = () => {
    if (!predictionData || !predictionData.success || !predictionData.result?.data) {
      return [];
    }
    
    const data = predictionData.result.data;
    const filteredData = filterDataBySearch(data);
    
    return showAll ? filteredData : filteredData.slice(0, 4);
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

  // Category-wise statistics
  const getCategoryStats = () => {
    if (!predictionData || !predictionData.success || !predictionData.result?.data) {
      return [];
    }

    const data = predictionData.result.data;
    const categoryMap = {};

    data.forEach(item => {
      const category = item.category || 'GENERAL';
      if (!categoryMap[category]) {
        categoryMap[category] = {
          count: 0,
          minOpening: Infinity,
          maxClosing: 0,
          totalOpening: 0,
          totalClosing: 0
        };
      }

      const stats = categoryMap[category];
      stats.count++;
      stats.minOpening = Math.min(stats.minOpening, item.openingRank || Infinity);
      stats.maxClosing = Math.max(stats.maxClosing, item.closingRank || 0);
      stats.totalOpening += item.openingRank || 0;
      stats.totalClosing += item.closingRank || 0;
    });

    return Object.entries(categoryMap).map(([category, stats]) => ({
      category,
      count: stats.count,
      avgOpening: Math.round(stats.totalOpening / stats.count),
      avgClosing: Math.round(stats.totalClosing / stats.count),
      minOpening: stats.minOpening === Infinity ? 0 : stats.minOpening,
      maxClosing: stats.maxClosing
    }));
  };

  const categoryStats = getCategoryStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToSearch}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors hover:cursor-pointer mb-3"
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
          <RankPredictionShimmer />
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

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search programs, categories, years, or rounds..."
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Main Content with Data Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border overflow-hidden mb-8"
            >
              <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-gray-900">Cutoff Ranks</h2>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                        {showAll ? (
                          <span>Page {currentPage} of {totalPages}</span>
                        ) : (
                          <span>Preview</span>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <p className="text-sm text-gray-500">
                        {showAll ? (
                          <span>{dataToDisplay.length} records • Total: {totalRecords}</span>
                        ) : (
                          <span>Showing {dataToDisplay.length} out of {totalRecords} records</span>
                        )}
                      </p>
                      {searchQuery && (
                        <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          Search: "{searchQuery}"
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {!showAll && totalRecords > 4 && (
                      <button
                        onClick={handleViewAllClick}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-lg whitespace-nowrap"
                      >
                        <Eye className="h-4 w-4" />
                        View All ({totalRecords})
                      </button>
                    )}
                    
                    <button
                      onClick={() => setShowFilterModal(true)}
                      className="flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2.5 px-5 rounded-lg transition-all hover:bg-gray-50 whitespace-nowrap"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                    </button>
                    
                    <button className="flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2.5 px-5 rounded-lg transition-all hover:bg-gray-50 whitespace-nowrap">
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 min-w-[200px]">Academic Program</th>
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
                        <tr 
                          key={index} 
                          className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => {
                            toast.info(`Selected: ${item.academicProgramName || 'Program'}`);
                          }}
                        >
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-900">
                              {item.academicProgramName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.quotaType || 'Regular'}
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
                          <div className="text-gray-400 mb-3">No matching records found</div>
                          <p className="text-gray-500">Try adjusting your filters or search query</p>
                          <button
                            onClick={handleResetFilters}
                            className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                          >
                            Reset Filters
                          </button>
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
                      <div className="flex items-center gap-1 overflow-x-auto py-2">
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

            {/* Category-wise Statistics */}
            {categoryStats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg border p-6 mb-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <PieChart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Category-wise Analysis</h2>
                    <p className="text-sm text-gray-500">Click on any category to filter</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categoryStats.map((stat, index) => (
                    <div 
                      key={index}
                      className="border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => {
                        handleFilterChange('category', stat.category);
                        toast.success(`Filtered by ${stat.category}`);
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(stat.category)}`}>
                          {stat.category}
                        </span>
                        <span className="text-sm text-gray-500">{stat.count} records</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Avg Opening:</span>
                          <span className="font-medium text-green-700">{stat.avgOpening.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Avg Closing:</span>
                          <span className="font-medium text-red-700">{stat.avgClosing.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Min Opening:</span>
                          <span className="font-medium text-green-600">{stat.minOpening.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t text-center">
                        <span className="text-xs text-blue-600 font-medium group-hover:text-blue-700">
                          Click to filter by {stat.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
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
                      Email Id*
                    </label>
                    <input
                      type="email"
                      value={userDetails.emailId}
                      onChange={(e) => setUserDetails({...userDetails, emailId: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                        formErrors.emailId ? 'border-red-500' : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                      }`}
                      placeholder="Enter your email address"
                    />
                    {formErrors.emailId && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.emailId}</p>
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
                    disabled={submitLoading}
                    className={`flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg transition-all font-medium ${
                      submitLoading 
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:from-blue-600 hover:to-blue-700'
                    }`}
                  >
                    {submitLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'View All Data'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Filter Modal */}
        <FilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          filters={filters}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
        />
      </div>
    </div>
  );
};

export default RankPredictionResults;