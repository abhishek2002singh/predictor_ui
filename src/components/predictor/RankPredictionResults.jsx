import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, School, Filter, TrendingUp, TrendingDown, BarChart3, Download, Eye, Loader2, AlertCircle, ChevronLeft, ChevronRight, Search, PieChart, X, Menu } from 'lucide-react';
import { fetchRankPrediction, showAllData, setUserDetailsSubmitted, submitUserDetails, checkUserDetailsStatus } from '../../slice/rankPredictionSlice';
import { toast } from 'react-toastify';
import FilterModal from '../../modal/FilterModal';
import RankPredictionShimmer from '../shimmer/RankPredictionShimmer';

const RankPredictionResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get data from navigation state
  const { collegeName, collegeId, counselingType, counselingName, collegeType, collegeShortName } = location.state || {};

  // Get state from Redux
  const { predictionData, loading, error, showAllData: showAll, userDetailsSubmitted, submitLoading, submitError } = useSelector(state => state.rankPrediction);

  // State for modal
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    homeState: '',
    mobileNumber: '',
    emailId: '',
    city: ''
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

  // Check user details status on component mount
  useEffect(() => {
    dispatch(checkUserDetailsStatus());
  }, [dispatch]);

  // Helper function to check if user details are stored in localStorage
  const checkUserDetailsInStorage = () => {
    try {
      const storedData = localStorage.getItem('rankPredictionUserDetails');
      if (!storedData) return false;
      
      const { userData, expiresAt } = JSON.parse(storedData);
      
      // Check if data is expired
      if (new Date() > new Date(expiresAt)) {
        localStorage.removeItem('rankPredictionUserDetails');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking user details in localStorage:', error);
      return false;
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    if (collegeName && counselingType) {
      const predictionData = {
        institute: collegeName,
        CounselingType: counselingType
      };
      dispatch(fetchRankPrediction(predictionData));
    } else {
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
    const hasUserDetails = checkUserDetailsInStorage();
    
    if (!hasUserDetails && !userDetailsSubmitted) {
      setShowUserDetailsModal(true);
    } else {
      dispatch(showAllData());
      toast.success('Showing all data');
    }
  };

  // Handle user details submission
  const handleSubmitUserDetails = async (e) => {
    e.preventDefault();

    // Validation
    const errors = {};
    if (!userDetails.firstName.trim()) errors.firstName = 'First name is required';
    if (!userDetails.homeState.trim()) errors.homeState = 'Home state is required';
    if(!userDetails.city.trim()) errors.city = 'City is required';
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
      const userDataPayload = {
        mobileNumber: userDetails.mobileNumber,
        firstName: userDetails.firstName,
        emailId: userDetails.emailId,
        city: userDetails.city,
        homeState: userDetails.homeState,
      };

      const result = await dispatch(submitUserDetails(userDataPayload)).unwrap();

      dispatch(setUserDetailsSubmitted(true));
      dispatch(showAllData());
      setShowUserDetailsModal(false);
      setUserDetails({
        firstName: '',
       
        mobileNumber: '',
        emailId: '',
        city: '',
        homeState: '',

      });
      setFormErrors({});
      toast.success('Details submitted successfully! Showing all data.');
    } catch (error) {
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

    const payload = {
      institute: collegeName,
      CounselingType: counselingType,
      ...(value !== 'all' && { [filterType]: value })
    };
    
    // Check if user details are required for category filtering
    if (filterType === 'category' && value !== 'all') {
      const hasUserDetails = checkUserDetailsInStorage();
      
      if (!hasUserDetails && !userDetailsSubmitted) {
        setShowUserDetailsModal(true);
        return; // Don't proceed with API call until user submits details
      }
    }
    
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

    // Check if user details are required when applying filters
    const hasUserDetails = checkUserDetailsInStorage();
    if (!hasUserDetails && !userDetailsSubmitted) {
      setShowUserDetailsModal(true);
      return;
    }

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

  // Handle category-wise analysis click
  const handleCategoryAnalysisClick = (category) => {
    const hasUserDetails = checkUserDetailsInStorage();
    
    if (!hasUserDetails && !userDetailsSubmitted) {
      setShowUserDetailsModal(true);
    } else {
      handleFilterChange('category', category);
      toast.success(`Filtered by ${category}`);
    }
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
    switch (type) {
      case 'IIT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'NIT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IIIT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'GFTI':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
          className="px-2 sm:px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2 text-gray-400">
            ...
          </span>
        );
      }
    }

    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-2 sm:px-3 py-1.5 border rounded-lg text-sm ${currentPage === i
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
          <span key="ellipsis2" className="px-2 text-gray-400">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-2 sm:px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
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
          <div className="px-4 sm:px-6 lg:px-8">
            <RankPredictionShimmer />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-12 text-center">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Error Loading Data
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                {typeof error === 'string' ? error : 'Failed to load data'}
              </p>
              <button
                onClick={handleBackToSearch}
                className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
              >
                Go Back to Search
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {!loading && !error && predictionData && predictionData.success && (
          <>
            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Best Opening Rank</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {stats?.bestOpeningRank?.toLocaleString() || 'N/A'}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-red-500">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Worst Closing Rank</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {stats?.worstClosingRank?.toLocaleString() || 'N/A'}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Avg Opening Rank</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {stats?.averageOpeningRank?.toLocaleString() || 'N/A'}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between mb-2">
                    <School className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Records</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {stats?.totalRecords?.toLocaleString() || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Search Bar
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search programs, categories, years, or rounds..."
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
            </div> */}

            {/* Main Content with Data Table */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Cutoff Ranks</h2>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {showAll ? (
                          <span>Page {currentPage} of {totalPages}</span>
                        ) : (
                          <span>Preview</span>
                        )}
                      </p>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {showAll ? (
                        <span>{dataToDisplay.length} records • Total: {totalRecords}</span>
                      ) : (
                        <span>Showing {dataToDisplay.length} out of {totalRecords} records</span>
                      )}
                    </div>
                  </div>

                  {searchQuery && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-600">
                        Search: "{searchQuery}"
                      </span>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-blue-500 hover:text-blue-700 text-xs sm:text-sm"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {!showAll && totalRecords > 4 && (
                    <button
                      onClick={handleViewAllClick}
                      className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 sm:py-2.5 px-4 sm:px-5 rounded-lg transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                      <Eye className="w-4 h-4" />
                      View All ({totalRecords})
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const hasUserDetails = checkUserDetailsInStorage();
                      if (!hasUserDetails && !userDetailsSubmitted) {
                        setShowUserDetailsModal(true);
                      } else {
                        setShowFilterModal(true);
                      }
                    }}
                    className="flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2 sm:py-2.5 px-4 sm:px-5 rounded-lg transition-all hover:bg-gray-50 text-sm sm:text-base"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                  <button className="flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2 sm:py-2.5 px-4 sm:px-5 rounded-lg transition-all hover:bg-gray-50 text-sm sm:text-base">
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>

                {/* Data Table - Desktop */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Academic Program
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Year
                        </th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Round
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Gender
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Opening Rank
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Closing Rank
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dataToDisplay.length > 0 ? (
                        dataToDisplay.map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-blue-50 transition-colors cursor-pointer"
                            onClick={() => {
                              toast.info(`Selected: ${item.academicProgramName || 'Program'}`);
                            }}
                          >
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.academicProgramName || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {item.quotaType || 'Regular'}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              {item.year || 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                Round {item.round || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(item.category)}`}>
                                {item.category || 'General'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              {item.gender || 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-green-600">
                                {(item.openingRank || 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-red-600">
                                {(item.closingRank || 0).toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                No matching records found
                              </h3>
                              <p className="text-gray-600 mb-4">
                                Try adjusting your filters or search query
                              </p>
                              <button
                                onClick={handleResetFilters}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                Reset Filters
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
                </div>

                {/* Data Cards - Mobile & Tablet */}
                <div className="lg:hidden divide-y divide-gray-200">
                  {dataToDisplay.length > 0 ? (
                    dataToDisplay.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 sm:p-5 hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={() => {
                          toast.info(`Selected: ${item.academicProgramName || 'Program'}`);
                        }}
                      >
                        <div className="space-y-3">
                          {/* Program Name */}
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">
                              {item.academicProgramName || 'N/A'}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                              {item.quotaType || 'Regular'}
                            </p>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              Round {item.round || 'N/A'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(item.category)}`}>
                              {item.category || 'General'}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              {item.year || 'N/A'}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              {item.gender || 'N/A'}
                            </span>
                          </div>

                          {/* Ranks */}
                          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Opening Rank</p>
                              <p className="text-base sm:text-lg font-semibold text-green-600">
                                {(item.openingRank || 0).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Closing Rank</p>
                              <p className="text-base sm:text-lg font-semibold text-red-600">
                                {(item.closingRank || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-12 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                        No matching records found
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Try adjusting your filters or search query
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination - Only show when viewing all data */}
              {showAll && totalPages > 1 && (
                <div className="mt-6 bg-white rounded-xl shadow-lg p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                      Showing page {currentPage} of {totalPages} ({result.limit || 20} records per page)
                    </p>

                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!hasPrevPage}
                        className={`flex items-center gap-1 px-3 sm:px-4 py-2 rounded-lg border text-sm ${hasPrevPage
                            ? 'hover:bg-gray-50 text-gray-700'
                            : 'opacity-50 cursor-not-allowed text-gray-400'
                          }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        {generatePaginationButtons()}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!hasNextPage}
                        className={`flex items-center gap-1 px-3 sm:px-4 py-2 rounded-lg border text-sm ${hasNextPage
                            ? 'hover:bg-gray-50 text-gray-700'
                            : 'opacity-50 cursor-not-allowed text-gray-400'
                          }`}
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}



              {/* Category-wise Statistics */}
              {categoryStats.length > 0 && (
                <div className="mt-8">
                  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4 sm:mb-6">
                      <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        Category-wise Analysis
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                      Click on any category to filter
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {categoryStats.map((stat, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-white to-gray-50"
                          onClick={() => handleCategoryAnalysisClick(stat.category)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(stat.category)}`}>
                              {stat.category}
                            </span>
                            <span className="text-xs text-gray-600">{stat.count} records</span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-600">Avg Opening:</span>
                              <span className="font-semibold text-green-600">
                                {stat.avgOpening.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-600">Avg Closing:</span>
                              <span className="font-semibold text-red-600">
                                {stat.avgClosing.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-600">Min Opening:</span>
                              <span className="font-semibold text-blue-600">
                                {stat.minOpening.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t text-xs text-gray-500 text-center">
                            Click to filter by {stat.category}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* User Details Modal */}
        {showUserDetailsModal && (
          <div className="fixed inset-0 bg-gray-400/80   flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 sm:p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold">Get Full Access</h3>
                    <p className="text-xs sm:text-sm text-blue-100 mt-1">
                      Enter your details to view all data
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUserDetailsModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitUserDetails} className="p-4 sm:p-6 space-y-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={userDetails.firstName}
                    onChange={(e) => setUserDetails({ ...userDetails, firstName: e.target.value })}
                    className={`w-full px-4 py-2.5 sm:py-3 border rounded-lg outline-none transition-colors text-sm sm:text-base ${formErrors.firstName
                        ? 'border-red-500'
                        : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                      }`}
                    placeholder="Enter your first name"
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500">{formErrors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={userDetails.lastName}
                    onChange={(e) => setUserDetails({ ...userDetails, lastName: e.target.value })}
                    className={`w-full px-4 py-2.5 sm:py-3 border rounded-lg outline-none transition-colors text-sm sm:text-base ${formErrors.lastName
                        ? 'border-red-500'
                        : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                      }`}
                    placeholder="Enter your last name"
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500">{formErrors.lastName}</p>
                  )}
                </div> */}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Id*
                  </label>
                  <input
                    type="email"
                    value={userDetails.emailId}
                    onChange={(e) => setUserDetails({ ...userDetails, emailId: e.target.value })}
                    className={`w-full px-4 py-2.5 sm:py-3 border rounded-lg outline-none transition-colors text-sm sm:text-base ${formErrors.emailId
                        ? 'border-red-500'
                        : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                      }`}
                    placeholder="Enter your email address"
                  />
                  {formErrors.emailId && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500">{formErrors.emailId}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={userDetails.mobileNumber}
                    onChange={(e) => setUserDetails({ ...userDetails, mobileNumber: e.target.value })}
                    className={`w-full px-4 py-2.5 sm:py-3 border rounded-lg outline-none transition-colors text-sm sm:text-base ${formErrors.mobileNumber
                        ? 'border-red-500'
                        : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                      }`}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                  />
                  {formErrors.mobileNumber && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500">{formErrors.mobileNumber}</p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State*
                  </label>
                  <input
                    type="text"
                    value={userDetails?.homeState}
                    onChange={(e) => setUserDetails({ ...userDetails, homeState: e.target.value })}
                    className={`w-full px-4 py-2.5 sm:py-3 border rounded-lg outline-none transition-colors text-sm sm:text-base ${formErrors.homeState
                        ? 'border-red-500'
                        : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                      }`}
                    placeholder="Enter your state"
                  />
                  {formErrors.homeState && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500">{formErrors.homeState}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City*
                  </label>
                  <input
                    type="text"
                    value={userDetails.city}
                    onChange={(e) => setUserDetails({ ...userDetails, city: e.target.value })}
                    className={`w-full px-4 py-2.5 sm:py-3 border rounded-lg outline-none transition-colors text-sm sm:text-base ${formErrors.city
                        ? 'border-red-500'
                        : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                      }`}
                    placeholder="Enter your city"
                  />
                  {formErrors.city && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500">{formErrors.city}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUserDetailsModal(false)}
                    className="flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex-1 px-4 py-2.5 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {submitLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'View All Data'
                    )}
                  </button>
                </div>
              </form>
            </div>
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