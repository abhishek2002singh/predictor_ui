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
  ChevronRight
} from "lucide-react";
import { setShowMoreForm, setFormData, updateUserData, fetchCutoffs } from "../../slice/predictorSlice";

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

  // Get initial data from navigation state
  const { initialCutoffs, userData: initialUserData } = location.state || {};

  useEffect(() => {
    if (initialCutoffs) {
      setShowAllColleges(false);
    }
  }, [initialCutoffs]);

  const displayedColleges = showAllColleges 
    ? cutoffs 
    : (initialCutoffs || cutoffs).slice(0, 3);

  const handleShowMore = () => {
    // Show the form when user clicks "Show All Colleges"
    dispatch(setShowMoreForm(true));
  };

  const handleViewAll = () => {
    // Directly show all colleges without form
    setShowAllColleges(true);
    fetchAllColleges();
  };

  const fetchAllColleges = async (page = 1) => {
    if (!userData) {
      console.error("User data not available");
      return;
    }
    
    // Check for required parameters
    const requiredParams = ['rank', 'category', 'gender', 'examType'];
    const missingParams = requiredParams.filter(param => !userData[param]);
    
    if (missingParams.length > 0) {
      console.error(`Missing required parameters: ${missingParams.join(', ')}`);
      // You can show an error message to the user here
      alert(`Please complete your profile: Missing ${missingParams.join(', ')}`);
      return;
    }
    
    try {
      const params = {
        rank: userData.rank,
        category: userData.category,
        gender: userData.gender,
        typeOfExam: userData.examType,
        page,
        limit: 20
      };
      
      console.log("Fetching colleges with params:", params);
      await dispatch(fetchCutoffs(params)).unwrap();
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch all colleges:", error);
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
        // Update existing user
        await dispatch(updateUserData({
          id: userData._id,
          userData: moreFormData
        })).unwrap();
      }
      
      // Fetch all colleges
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
    return userData?.rank && userData?.category && userData?.gender && userData?.examType;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Simplified to match image */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            College Predictions
          </h1>
          <p className="text-gray-600 text-lg">
            Based on your rank: <span className="font-semibold text-gray-800">{userData?.rank || 'N/A'}</span> | 
            Category: <span className="font-semibold text-gray-800">{userData?.category || 'N/A'}</span> | 
            Gender: <span className="font-semibold text-gray-800">{userData?.gender || 'N/A'}</span>
          </p>
        </motion.div>

        {/* Main Content - Single column layout as in image */}
        <div className="max-w-6xl mx-auto">
          {/* Recommended Colleges Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Recommended Colleges ({displayedColleges.length})
              </h2>
              {!showAllColleges && displayedColleges.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">
                    Showing {displayedColleges.length} of {pagination.total}
                  </span>
                  <button
                    onClick={handleViewAll}
                    className="text-blue-600 hover:text-blue-700 font-medium underline flex items-center gap-1"
                  >
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="border-b border-gray-200 mb-6"></div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : displayedColleges.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No colleges found for your criteria.</p>
              </div>
            ) : (
              <div className={`space-y-8 ${showAllColleges ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : ''}`}>
                {displayedColleges.map((college, index) => (
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

            {/* Show All Colleges Button - Shows form */}
            {!showAllColleges && displayedColleges.length > 0 && (
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
                  Complete your profile to view all {pagination.total} recommended colleges
                </p>
              </div>
            )}

            {/* Pagination - Only show when viewing all colleges */}
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

          {/* Stats Card - Positioned after colleges like in image */}
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
                <p className="text-3xl font-bold">{pagination.total}</p>
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

      {/* Show More Form Modal */}
      <AnimatePresence>
        {showMoreForm && (
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
              
              <p className="text-gray-600 mb-8 text-center">
                Please provide your details to view all college predictions.
              </p>
              
              <form onSubmit={handleMoreFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={moreFormData.firstName}
                    onChange={(e) => dispatch(setFormData({ firstName: e.target.value }))}
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-colors ${
                      formErrors.firstName 
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
                    value={moreFormData.lastName}
                    onChange={(e) => dispatch(setFormData({ lastName: e.target.value }))}
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-colors ${
                      formErrors.lastName 
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
                    value={moreFormData.emailId}
                    onChange={(e) => dispatch(setFormData({ emailId: e.target.value }))}
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-colors ${
                      formErrors.emailId 
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
                  We'll show you all {pagination.total} colleges after submitting
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