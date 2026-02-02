
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { showSuccess } from '../../utils/toast';
import { useNavigate, useLocation } from "react-router-dom";
import {
  Building2,
  MapPin,
  Users,
  Award,
  ArrowRight,
  Loader2,
  X,
  BarChart3,
  Check,
  ChevronRight,
  Home,
  ChevronLeft,
  FilterIcon,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import {
  setShowMoreForm,
  setFormData,
  updateUserData,
  fetchCutoffs,
  syncFromLocalStorage,
  updateProfileStatus
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
    userData,
    loading,
    pagination,
    showMoreForm,
    formData: moreFormData,
    hasCompletedProfile
  } = useSelector((state) => state.predictor);

  const [showAllColleges, setShowAllColleges] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    category: null,
    gender: null,
    year: 'all',
    round: 'all',
    branch: 'all',
    institute: 'all',
    quota: 'all'
  });

  // Get form data from navigation state
  const { formData: initialFormData } = location.state || {};

  // Sync localStorage on component mount
  useEffect(() => {
    dispatch(syncFromLocalStorage());
  }, [dispatch]);

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

  // Get user profile data from various sources
  const getUserProfileData = () => {
    // Priority: 1. location state (current search), 2. userData from Redux
    if (initialFormData?.rank && initialFormData?.category) {
      return initialFormData;
    } else if (userData?.rank && userData?.category) {
      return userData;
    }
    return null;
  };

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!initialFormData) {
        console.error("No form data found in location state");
        navigate('/');
        return;
      }

      console.log("DEBUG - Initial form data:", initialFormData);

      try {
        // Get profile data using the function
        const profileData = getUserProfileData();
        
        if (!profileData) {
          console.error("No profile data available");
          navigate('/');
          return;
        }

        // Set initial filters from form data
        setSelectedFilters(prev => ({
          ...prev,
          category: profileData.category || null,
          gender: profileData.gender || null
        }));

        // Always fetch initial 3 colleges regardless of profile status
        const params = {
          rank: profileData.rank,
          category: profileData.category,
          gender: profileData.gender,
          typeOfExam: profileData.examType,
          page: 1,
          limit: 3
        };

        console.log("DEBUG - Fetching initial cutoffs with params:", params);

        await dispatch(fetchCutoffs(params)).unwrap();

        // If user has completed profile, automatically show all colleges
        if (hasCompletedProfile) {
          console.log("User has completed profile, showing all colleges immediately");
          await fetchAllColleges(1);
          setShowAllColleges(true);
        }
      } catch (error) {
        console.error("Failed to fetch initial colleges:", error);
        setApiError(error.message || "Failed to load college data. Please try again.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [dispatch, navigate, initialFormData, hasCompletedProfile]);

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
      const profileData = getUserProfileData();
      if (!profileData) {
        alert("Search criteria not available. Please fill the form again.");
        navigate('/');
        return;
      }

      const params = {
        rank: profileData.rank,
        category: profileData.category,
        gender: selectedFilters.gender || profileData.gender,
        typeOfExam: profileData.examType,
        page: 1,
        limit: showAllColleges ? 20 : 3,
        year: selectedFilters.year,
        round: selectedFilters.round,
        branch: selectedFilters.branch,
        institute: selectedFilters.institute,
        quota: selectedFilters.quota
      };

      // Remove 'all' values
      Object.keys(params).forEach(key => {
        if (params[key] === 'all' || params[key] === null) {
          delete params[key];
        }
      });

      console.log("DEBUG - Applying filters with params:", params);
      await dispatch(fetchCutoffs(params)).unwrap();
      setShowFilterModal(false);
      setCurrentPage(1);

      // Show success message
      const activeFilters = Object.entries(selectedFilters)
        .filter(([_, value]) => value !== 'all' && value !== null)
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
      category: null,
      gender: null,
      year: 'all',
      round: 'all',
      branch: 'all',
      institute: 'all',
      quota: 'all'
    });
  };

  // Handle "View All" button click
  const handleViewAll = async () => {
    try {
      if (hasCompletedProfile) {
        // User has already completed profile, show all colleges directly
        setShowAllColleges(true);
        await fetchAllColleges(1);
      } else {
        // User hasn't completed profile, show the form modal
        dispatch(setShowMoreForm(true));
      }
    } catch (error) {
      console.error("Failed to view all colleges:", error);
      setApiError(error.message || "Failed to fetch all colleges.");
    }
  };

  // Fetch all colleges with pagination (20 per page)
  const fetchAllColleges = async (page = 1) => {
    const profileData = getUserProfileData();

    if (!profileData) {
      alert("Search criteria not available. Please fill the form again.");
      navigate('/');
      return;
    }

    try {
      const params = {
        rank: profileData.rank,
        category: profileData.category,
        gender: selectedFilters.gender || profileData.gender,
        typeOfExam: profileData.examType,
        page,
        limit: 20 // Show 20 colleges per page
      };

      // Add additional filters if not 'all'
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

      console.log("DEBUG - Fetching all colleges with params:", params);

      await dispatch(fetchCutoffs(params)).unwrap();
      setCurrentPage(page);
      setApiError(""); // Clear any previous errors

      // Show success toast if this is first page and user has profile
      if (page === 1 && hasCompletedProfile) {
        showSuccess(`Showing all colleges for rank ${profileData.rank}, ${profileData.category}`);
      }
    } catch (error) {
      console.error("Failed to fetch all colleges:", error);
      throw error;
    }
  };

  // Validate the "Complete Your Profile" form
  const validateForm = () => {
    const errors = {};

    if (!moreFormData.firstName?.trim()) {
      errors.firstName = "First name is required";
    }

    if (!moreFormData.lastName?.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!moreFormData.emailId?.trim()) {
      errors.emailId = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(moreFormData.emailId)) {
      errors.emailId = "Please enter a valid email";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission for "Complete Your Profile"
  const handleMoreFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // First update user data if we have user ID
      if (userData?._id) {
        console.log("Updating user data with:", moreFormData);
        await dispatch(updateUserData({
          id: userData._id,
          userData: moreFormData
        })).unwrap();
      }

      // Then fetch all colleges with pagination
      await fetchAllColleges(1);
      setShowAllColleges(true);
      dispatch(setShowMoreForm(false));

      // Update profile status in Redux
      dispatch(updateProfileStatus());

      // Show success message
      showSuccess("Profile completed! You can now view all colleges.");
    } catch (error) {
      console.error("Failed to process form:", error);
      setApiError(error.message || "Failed to submit form. Please try again.");
    }
  };

  // Handle page change in pagination
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.pages) return;
    fetchAllColleges(page);
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const pages = [];
    const totalPages = pagination.pages;

    if (totalPages <= 7) {
      // Show all pages if total pages is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end
      let start = Math.max(2, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);

      // Adjust if we're near the start
      if (currentPage <= 3) {
        start = 2;
        end = 5;
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
        end = totalPages - 1;
      }

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
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

  // Get display data for header
  const getDisplayData = () => {
    const profileData = getUserProfileData();
    return {
      rank: profileData?.rank || 'N/A',
      category: profileData?.category || 'N/A',
      gender: profileData?.gender || 'N/A',
      examType: profileData?.examType || 'N/A'
    };
  };

  // Calculate showing range (e.g., 1-20 of 100)
  const getShowingRange = () => {
    if (!showAllColleges) {
      return { from: 1, to: Math.min(3, pagination.total), total: pagination.total };
    }

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

  const displayData = getDisplayData();
  const summaryStats = getSummaryStats();
  const showingRange = getShowingRange();

  // Determine which colleges to display
  const displayedColleges = showAllColleges ? cutoffs : cutoffs.slice(0, 3);

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

              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <CollegeCardShimmer key={i} />
                ))}
              </div>

              <div className="mt-10 text-center">
                <div className="h-12 bg-gray-300 rounded-xl w-64 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-96 mx-auto mt-4"></div>
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
            Based on: Rank <span className="font-semibold text-gray-800">{displayData.rank}</span> |
            Category <span className="font-semibold text-gray-800">{displayData.category}</span> |
            Gender <span className="font-semibold text-gray-800">{displayData.gender}</span> |
            Exam <span className="font-semibold text-gray-800">{displayData.examType}</span>
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
                  {showAllColleges
                    ? `Showing colleges ${showingRange.from}-${showingRange.to} of ${summaryStats.totalColleges}`
                    : `Showing 3 of ${summaryStats.totalColleges} colleges`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {showAllColleges && (
                  <button
                    onClick={() => setShowFilterModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    Filter
                    <FilterIcon className="h-4 w-4" />
                  </button>
                )}
                {!showAllColleges && cutoffs.length > 0 && (
                  <button
                    onClick={handleViewAll}
                    disabled={loading}
                    className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {hasCompletedProfile ? 'View All' : 'View All'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="border-b border-gray-200 mb-6"></div>

            {loading ? (
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <CollegeCardShimmer key={i} />
                ))}
              </div>
            ) : displayedColleges.length === 0 ? (
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
                <div className={`${showAllColleges ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-8'}`}>
                  {displayedColleges.map((college, index) => (
                    <motion.div
                      key={college._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow ${showAllColleges ? 'h-full' : ''
                        }`}
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

                {/* Show All Colleges Button - Only show when not viewing all colleges */}
                {!showAllColleges && cutoffs.length > 0 && (
                  <div className="mt-10 text-center">
                    <motion.button
                      onClick={handleViewAll}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-xl transition-all shadow-md"
                    >
                      <span>{hasCompletedProfile ? 'View All Colleges' : 'Show All Colleges'}</span>
                      <ArrowRight className="h-5 w-5" />
                    </motion.button>
                    {!hasCompletedProfile && (
                      <p className="text-sm text-gray-500 mt-4">
                        Complete your profile to view all {summaryStats.totalColleges} recommended colleges
                      </p>
                    )}
                  </div>
                )}

                {/* Pagination - Only show when viewing all colleges */}
                {showAllColleges && pagination.pages > 0 && (
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

      {/* Show More Form Modal - Only show if user hasn't completed profile */}
      <AnimatePresence>
        {showMoreForm && !hasCompletedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => dispatch(setShowMoreForm(false))}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900">
                  Complete Your Profile
                </h3>
                <button
                  onClick={() => dispatch(setShowMoreForm(false))}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleMoreFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={moreFormData.firstName || ''}
                    onChange={(e) => dispatch(setFormData({ firstName: e.target.value }))}
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-colors ${formErrors.firstName
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-gray-300 focus:border-blue-500'
                      }`}
                    placeholder="Enter your first name"
                  />
                  {formErrors.firstName && (
                    <p className="text-red-500 text-sm mt-2">{formErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={moreFormData.lastName || ''}
                    onChange={(e) => dispatch(setFormData({ lastName: e.target.value }))}
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-colors ${formErrors.lastName
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-gray-300 focus:border-blue-500'
                      }`}
                    placeholder="Enter your last name"
                  />
                  {formErrors.lastName && (
                    <p className="text-red-500 text-sm mt-2">{formErrors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={moreFormData.emailId || ''}
                    onChange={(e) => dispatch(setFormData({ emailId: e.target.value }))}
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-colors ${formErrors.emailId
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-gray-300 focus:border-blue-500'
                      }`}
                    placeholder="Enter your email"
                  />
                  {formErrors.emailId && (
                    <p className="text-red-500 text-sm mt-2">{formErrors.emailId}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    'Show All Colleges'
                  )}
                </button>

                <p className="text-sm text-gray-500 text-center mt-4">
                  After submitting, you'll see all {summaryStats.totalColleges} colleges
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PredictColleges;