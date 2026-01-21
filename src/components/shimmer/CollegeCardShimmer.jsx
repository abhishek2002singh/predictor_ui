import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
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
  Home
} from "lucide-react";
import { setShowMoreForm, setFormData, updateUserData, fetchCutoffs } from "../../slice/predictorSlice";

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

const StatsCardShimmer = () => (
  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg animate-pulse">
    <div className="h-6 bg-blue-400/50 rounded w-48 mb-6"></div>
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="text-center">
          <div className="h-3 bg-blue-400/50 rounded w-20 mx-auto mb-1"></div>
          <div className="h-8 bg-blue-400/50 rounded w-12 mx-auto"></div>
        </div>
      ))}
    </div>
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
    formData: moreFormData
  } = useSelector((state) => state.predictor);
  
  const [showAllColleges, setShowAllColleges] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);

  // Get user data from navigation state
  const { userData: initialUserData } = location.state || {};

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      const profileData = getUserProfileData();
      
      if (!profileData) {
        console.error("No user data found");
        navigate('/'); // Redirect to predictor page
        return;
      }
      
      try {
        // Fetch first 3 colleges initially
        const params = {
          rank: profileData.rank,
          category: profileData.category,
          gender: profileData.gender,
          typeOfExam: profileData.examType,
          page: 1,
          limit: 3
        };
        
        await dispatch(fetchCutoffs(params)).unwrap();
      } catch (error) {
        console.error("Failed to fetch initial colleges:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchInitialData();
  }, [dispatch, navigate]);

  const handleShowMore = () => {
    dispatch(setShowMoreForm(true));
  };

  const handleViewAll = async () => {
    setShowAllColleges(true);
    await fetchAllColleges(1);
  };

  const getUserProfileData = () => {
    // Priority: 1. location state, 2. userData, 3. checkHistory
    if (initialUserData?.rank && initialUserData?.category) {
      return {
        rank: initialUserData.rank,
        category: initialUserData.category,
        gender: initialUserData.gender,
        examType: initialUserData.examType
      };
    } else if (userData?.rank && userData?.category) {
      return {
        rank: userData.rank,
        category: userData.category,
        gender: userData.gender,
        examType: userData.examType
      };
    } else if (userData?.checkHistory?.[0]) {
      return {
        rank: userData.checkHistory[0].rank,
        category: userData.checkHistory[0].category,
        gender: userData.checkHistory[0].gender,
        examType: userData.checkHistory[0].examType
      };
    }
    return null;
  };

  const fetchAllColleges = async (page = 1) => {
    const profileData = getUserProfileData();
    
    if (!profileData) {
      alert("User profile data not available. Please fill the form again.");
      navigate('/');
      return;
    }
    
    try {
      const params = {
        rank: profileData.rank,
        category: profileData.category,
        gender: profileData.gender,
        typeOfExam: profileData.examType,
        page,
        limit: 20
      };
      
      await dispatch(fetchCutoffs(params)).unwrap();
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch all colleges:", error);
      alert(`Failed to fetch colleges: ${error.message || 'Please try again'}`);
    }
  };

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

  const handleMoreFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (userData?._id) {
        await dispatch(updateUserData({
          id: userData._id,
          userData: moreFormData
        })).unwrap();
      }
      
      await fetchAllColleges();
      setShowAllColleges(true);
      dispatch(setShowMoreForm(false));
    } catch (error) {
      console.error("Failed to process form:", error);
    }
  };

  const handlePageChange = (page) => {
    fetchAllColleges(page);
  };

  const getProbabilityBadge = (probability, percentage) => {
    const probClass = probability === 'High Chance' 
      ? 'bg-green-100 text-green-800 border-green-300' 
      : probability === 'Medium Chance' 
        ? 'bg-yellow-100 text-yellow-800 border-yellow-300' 
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

  const calculateSuccessRate = () => {
    if (pagination.total === 0) return '0%';
    const highChanceCount = cutoffs.filter(c => c.probability === 'High Chance').length;
    return `${Math.round((highChanceCount / pagination.total) * 100)}%`;
  };

  // Check if we have all required user data
  const hasCompleteUserData = () => {
    const profileData = getUserProfileData();
    return profileData && profileData.rank && profileData.category && profileData.gender && profileData.examType;
  };

  // Get display data for header
  const getDisplayData = () => {
    const profileData = getUserProfileData();
    return {
      rank: profileData?.rank || 'N/A',
      category: profileData?.category || 'N/A',
      gender: profileData?.gender || 'N/A'
    };
  };

  const displayData = getDisplayData();

  // Show shimmer loading
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
            
            <StatsCardShimmer />
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
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          <Home className="h-4 w-4" />
          Back to Predictor
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
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
            Based on your rank: <span className="font-semibold text-gray-800">{displayData.rank}</span> | 
            Category: <span className="font-semibold text-gray-800">{displayData.category}</span> | 
            Gender: <span className="font-semibold text-gray-800">{displayData.gender}</span>
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Recommended Colleges Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Recommended Colleges ({displayData.length || 0})
              </h2>
              {!showAllColleges && cutoffs.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">
                    Showing {cutoffs.length} of {pagination.total || 0}
                  </span>
                  <button
                    onClick={handleViewAll}
                    disabled={!hasCompleteUserData()}
                    className={`text-blue-600 hover:text-blue-700 font-medium underline flex items-center gap-1 ${
                      !hasCompleteUserData() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="border-b border-gray-200 mb-6"></div>

            {loading ? (
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
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
              <div className={`space-y-8 ${showAllColleges ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}`}>
                {cutoffs.map((college, index) => (
                  <motion.div
                    key={college._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow ${
                      showAllColleges ? 'h-full' : ''
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
                        {college.probabilityPercentage && (
                          <div className="flex items-center gap-3">
                            <div className="h-5 w-5 flex items-center justify-center flex-shrink-0">
                              <Check className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-600 mb-1">Admission Probability</p>
                              <div className="flex items-center gap-2">
                                <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      college.probability === 'High Chance' ? 'bg-green-500' :
                                      college.probability === 'Medium Chance' ? 'bg-yellow-500' :
                                      'bg-red-500'
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
            )}

            {/* Show All Colleges Button */}
            {!showAllColleges && cutoffs.length > 0 && (
              <div className="mt-10 text-center">
                <motion.button
                  onClick={handleShowMore}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-xl transition-all shadow-md"
                >
                  <span>Show All Colleges</span>
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
                <p className="text-sm text-gray-500 mt-4">
                  Complete your profile to view all {pagination.total || 0} recommended colleges
                </p>
              </div>
            )}

            {/* Pagination */}
            {showAllColleges && pagination.pages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Prediction Stats
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm opacity-90 mb-1">Total Colleges</p>
                <p className="text-3xl font-bold">{pagination.total || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90 mb-1">High Chance</p>
                <p className="text-3xl font-bold">
                  {cutoffs.filter(c => c.probability === 'High Chance').length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90 mb-1">Success Rate</p>
                <p className="text-3xl font-bold">
                  {calculateSuccessRate()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Show More Form Modal - Same as before */}
      {/* ... Modal code remains exactly the same ... */}
    </div>
  );
};

export default PredictColleges;