import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { showSuccess } from '../../utils/toast';
import { useNavigate, useLocation } from "react-router-dom";
import {
  Building2,
  MapPin,
  Users,
  Award,
  ArrowRight,
  ChevronRight,
  Home,
  ChevronLeft,
  FilterIcon,
  Check,
} from "lucide-react";
import {
  fetchCutoffs
} from "../../slice/predictorSlice";

// Import the filter modal component
import FilterModalForRankWiseSearch from '../../modal/FilterModalForRankWiseSearch';

// Shimmer Loading Component
const CollegeCardShimmer = () => (
  <div className="border border-gray-200 rounded-xl p-6 animate-pulse">
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-300 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
          <div className="h-8 bg-gray-300 rounded w-32"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4 p-4 bg-gray-50 rounded-lg flex-grow">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-5 w-5 bg-gray-300 rounded"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const HeaderShimmer = () => (
  <div className="mb-10 text-center animate-pulse">
    <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
  </div>
);

const PredictColleges = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    cutoffs,
    loading,
    pagination,
  } = useSelector((state) => state.predictor);

  const [currentPage, setCurrentPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    year: 'all',
    round: 'all',
    branch: 'all',
    institute: 'all',
    category: 'all',
    gender: 'all',
  });

  // Get form data from navigation state
  const { formData: initialFormData } = location.state || {};
  
  // Debug: Log what we're receiving
  useEffect(() => {
    console.log("Location state received:", location.state);
    console.log("Initial form data:", initialFormData);
  }, [location.state]);

  // Extract search parameters
  const searchRank = initialFormData?.rank;
  const searchExamType = initialFormData?.examType || initialFormData?.typeOfExam;

  // Fetch available filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/cutoffs/filter-options');
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            setAvailableFilters(data.data || {});
          }
        }
      } catch (error) {
        console.warn("Failed to fetch filter options:", error);
        setAvailableFilters({});
      }
    };

    fetchFilterOptions();
  }, []);

  // Initial data fetch - Fetch 20 colleges directly
  useEffect(() => {
    const fetchInitialData = async () => {
      console.log("Attempting to fetch data with:", { searchRank, searchExamType });
      
      if (!searchRank || !searchExamType) {
        console.error("Rank or exam type not found in location state");
        console.error("Available data:", { searchRank, searchExamType, locationState: location.state });
        
        // Try to get data from localStorage as fallback
        const savedData = localStorage.getItem('predictorFormData');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            console.log("Using localStorage data:", parsedData);
            
            // Use localStorage data
            const localStorageRank = parsedData.rank;
            const localStorageExamType = parsedData.examType;
            
            if (localStorageRank && localStorageExamType) {
              await fetchCollegesWithParams(localStorageRank, localStorageExamType);
              return;
            }
          } catch (e) {
            console.error("Error parsing localStorage data:", e);
          }
        }
        
        // If still no data, navigate back
        alert("No search data found. Please fill the form again.");
        navigate('/');
        return;
      }

      await fetchCollegesWithParams(searchRank, searchExamType);
    };

    const fetchCollegesWithParams = async (rank, examType) => {
      try {
        // Fetch 20 colleges directly
        const params = {
          rank: rank,
          typeOfExam: examType,
          page: 1,
          limit: 20
        };

        console.log("DEBUG - Fetching cutoffs with params:", params);

        const result = await dispatch(fetchCutoffs(params)).unwrap();
        
        console.log("DEBUG - API response:", result);
        
        // Show success toast
        showSuccess(`Showing colleges for rank ${rank}, ${examType}`);
        
      } catch (error) {
        console.error("Failed to fetch colleges:", error);
        setApiError(error.message || "Failed to load college data. Please try again.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [dispatch, navigate, searchRank, searchExamType]);

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Handle apply filters
  const handleApplyFilters = async () => {
    try {
      if (!searchRank || !searchExamType) {
        alert("Search criteria not available. Please fill the form again.");
        navigate('/');
        return;
      }

      const params = {
        rank: searchRank,
        typeOfExam: searchExamType,
        year: selectedFilters.year,
        round: selectedFilters.round,
        branch: selectedFilters.branch,
        institute: selectedFilters.institute,
        category: selectedFilters.category,
        gender: selectedFilters.gender,

        page: 1,
        limit: 20,
      };

      // Add filters if not 'all'
      if (selectedFilters.year && selectedFilters.year !== 'all') {
        params.year = selectedFilters.year;
      }
      if (selectedFilters.round && selectedFilters.round !== 'all') {
        params.round = selectedFilters.round;
      }
      if (selectedFilters.branch && selectedFilters.branch !== 'all') {
        params.branch = selectedFilters.branch;
      }
      if (selectedFilters.institute && selectedFilters.institute !== 'all') {
        params.institute = selectedFilters.institute;
      }
      if (selectedFilters.category && selectedFilters.category !== 'all') {
        params.category = selectedFilters.category;
      }
      if (selectedFilters.gender && selectedFilters.gender !== 'all') {
        params.gender = selectedFilters.gender;
      } 

      console.log("DEBUG - Applying filters with params:", params);
      await dispatch(fetchCutoffs(params)).unwrap();
      setShowFilterModal(false);
      setCurrentPage(1);

      // Show success message
      const activeFilters = Object.entries(selectedFilters)
        .filter(([_, value]) => value !== 'all')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      
      if (activeFilters) {
        showSuccess(`Filters applied: ${activeFilters}`);
      }
    } catch (error) {
      console.error("Failed to apply filters:", error);
      setApiError(error.message || "Failed to apply filters. Please try again.");
    }
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSelectedFilters({
      year: 'all',
      round: 'all',
      branch: 'all',
      institute: 'all',
      quota: 'all'
    });
  };

  // Fetch colleges with pagination (20 per page)
  const fetchColleges = async (page = 1) => {
    if (!searchRank || !searchExamType) {
      alert("Search criteria not available. Please fill the form again.");
      navigate('/');
      return;
    }

    try {
      const params = {
        rank: searchRank,
        typeOfExam: searchExamType,
        page,
        limit: 20
      };

      // Add filters if not 'all'
      if (selectedFilters.year && selectedFilters.year !== 'all') {
        params.year = selectedFilters.year;
      }
      if (selectedFilters.round && selectedFilters.round !== 'all') {
        params.round = selectedFilters.round;
      }
      if (selectedFilters.branch && selectedFilters.branch !== 'all') {
        params.branch = selectedFilters.branch;
      }
      if (selectedFilters.institute && selectedFilters.institute !== 'all') {
        params.institute = selectedFilters.institute;
      }
      if (selectedFilters.quota && selectedFilters.quota !== 'all') {
        params.quota = selectedFilters.quota;
      }

      console.log("DEBUG - Fetching colleges with params:", params);

      await dispatch(fetchCutoffs(params)).unwrap();
      setCurrentPage(page);
      setApiError("");
    } catch (error) {
      console.error("Failed to fetch colleges:", error);
      throw error;
    }
  };

  // Handle page change in pagination
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.pages) return;
    fetchColleges(page);
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const pages = [];
    const totalPages = pagination.pages;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);

      if (currentPage <= 3) {
        start = 2;
        end = 5;
      }

      if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
        end = totalPages - 1;
      }

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  // Get probability badge with appropriate styling
  const getProbabilityBadge = (probability, percentage) => {
    const probClass = probability === 'High Chance'
      ? 'bg-green-100 text-green-800 border-green-300'
      : probability === 'Medium Chance'
        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
        : probability === 'Low Chance'
          ? 'bg-orange-100 text-orange-800 border-orange-300'
          : 'bg-red-100 text-red-800 border-red-300';

    return (
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${probClass}`}>
          {probability}
        </span>
        {percentage && (
          <span className="text-sm text-gray-700 font-medium">
            {percentage}%
          </span>
        )}
      </div>
    );
  };

  // Calculate showing range (e.g., 1-20 of 100)
  const getShowingRange = () => {
    const from = ((currentPage - 1) * pagination.limit) + 1;
    const to = Math.min(currentPage * pagination.limit, pagination.total);

    return { from, to, total: pagination.total };
  };

  // Calculate summary statistics
  const getSummaryStats = () => {
    if (cutoffs.length === 0) {
      return {
        totalColleges: 0,
        collegesShown: 0,
        highestProbability: 0,
        averageProbability: 0,
        highChanceCount: 0
      };
    }

    const probabilities = cutoffs.map(c => c.probabilityPercentage || 0);
    const highChanceCount = cutoffs.filter(c => c.probability === 'High Chance').length;

    return {
      totalColleges: pagination.total || 0,
      collegesShown: cutoffs.length,
      highestProbability: Math.max(...probabilities),
      averageProbability: Math.round(probabilities.reduce((a, b) => a + b, 0) / probabilities.length),
      highChanceCount: highChanceCount
    };
  };

  const summaryStats = getSummaryStats();
  const showingRange = getShowingRange();

  // Show shimmer loading during initial load
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button Shimmer */}
          <div className="mb-6 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>

          <HeaderShimmer />

          <div className="max-w-6xl mx-auto">
            {/* Recommended Colleges Section Shimmer */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="h-7 bg-gray-300 rounded w-64"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="border-b border-gray-200 mb-6"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <CollegeCardShimmer key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex mt-7 items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors hover:cursor-pointer"
        >
          <Home className="h-4 w-4" />
          Back to Predictor
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Error Message */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-red-600 text-sm font-medium">{apiError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Reload Page
            </button>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            College Predictions
          </h1>
          <p className="text-gray-600 text-lg">
            Based on: Rank <span className="font-semibold text-gray-800">{searchRank}</span>
            <span className="ml-2">Exam <span className="font-semibold text-gray-800">{searchExamType}</span></span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <span className="px-3 py-3 text-sm font-semibold rounded-full bg-blue-100 text-blue-700 mx-auto">
            Total Recommended Colleges : {summaryStats.totalColleges}
          </span>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Recommended Colleges Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Recommended Colleges
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Showing colleges {showingRange.from}-{showingRange.to} of {summaryStats.totalColleges}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  Filter
                  <FilterIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="border-b border-gray-200 mb-6"></div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <CollegeCardShimmer key={i} />
                ))}
              </div>
            ) : cutoffs.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No colleges found for your criteria.</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Go back and try different criteria
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cutoffs.map((college, index) => (
                    <motion.div
                      key={college._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow h-full"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {college.institute}
                            </h3>
                            <p className="text-gray-700 mb-3">
                              {college.academicProgramName} {college.quota && `(${college.quota})`}
                            </p>
                            {getProbabilityBadge(college.probability, college.probabilityPercentage)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mt-4 p-4 bg-gray-50 rounded-lg flex-grow">
                          <div className="flex items-center gap-3">
                            <Award className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-600">Rank Range</p>
                              <p className="font-medium">
                                {college.openingRank} - {college.closingRank}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-600">Seat Type</p>
                              <p className="font-medium">{college.seatType}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-600">Round</p>
                              <p className="font-medium">{college.round}</p>
                            </div>
                          </div>
                          {college.probabilityPercentage !== undefined && (
                            <div className="flex items-center gap-3">
                              <div className="h-5 w-5 flex items-center justify-center flex-shrink-0">
                                <Check className="h-4 w-4 text-gray-500" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-600 mb-1">Admission Probability</p>
                                <div className="flex items-center gap-2">
                                  <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${college.probability === 'High Chance' ? 'bg-green-500' :
                                          college.probability === 'Medium Chance' ? 'bg-yellow-500' :
                                            college.probability === 'Low Chance' ? 'bg-red-500' :
                                              'bg-orange-500'
                                        }`}
                                      style={{ width: `${college.probabilityPercentage}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">
                                    {college.probabilityPercentage}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-8 flex flex-col items-center">
                    {/* Page Info */}
                    <p className="text-sm text-gray-600 mb-4">
                      Page {currentPage} of {pagination.pages} •
                      Showing {showingRange.from}-{showingRange.to} of {showingRange.total} colleges
                    </p>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </button>

                      {/* Page Numbers */}
                      {renderPaginationButtons().map((pageNum, index) => (
                        pageNum === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                            ...
                          </span>
                        ) : (
                          <button
                            key={`page-${pageNum}`}
                            onClick={() => handlePageChange(pageNum)}
                            disabled={loading || currentPage === pageNum}
                            className={`px-4 py-2 rounded-lg transition-colors min-w-[40px] ${currentPage === pageNum
                                ? 'bg-blue-600 text-white cursor-default'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {pageNum}
                          </button>
                        )
                      ))}

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.pages || loading}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Per Page Info */}
                    <p className="text-xs text-gray-500 mt-4">
                      20 colleges per page
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModalForRankWiseSearch
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        availableFilters={availableFilters}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
};

export default PredictColleges;