import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Search,
  ChevronDown,
  Loader2,
  GraduationCap,
  Phone,
  User,
  Mail,
  MapPin
} from "lucide-react";
import { STATES } from "../../utils/constants";
import { createUserData } from "../../slice/predictorSlice";
import { showError, showSuccess } from "../../utils/toast";

const EXAMS = [
  { value: "JEE_MAINS", label: "JEE Mains" },
  { value: "JEE_ADVANCED", label: "JEE Advanced" },
  { value: "CUET", label: "CUET" },
];

const Predictor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.predictor);

  const [formData, setFormData] = useState({
    firstName: "",
    emailId: "",
    mobileNumber: "",
    rank: "",
    homeState: "",
    examType: "",
    city: "",
  });
  const [focusedField, setFocusedField] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    // Validate firstName
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    }

    // Validate email
    if (!formData.emailId.trim() ) {
      errors.emailId = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId.trim())) {
      errors.emailId = "Please enter a valid email address";
    }

    // Validate mobile number
    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber.trim())) {
      errors.mobileNumber = "Please enter a valid 10-digit mobile number";
    }

    // Validate city
    if (!formData.city.trim()) {
      errors.city = "City is required";
    } else if (formData.city.trim().length < 2) {
      errors.city = "Please enter a valid city name";
    }

    // Validate rank
    if (!formData.rank.trim()) {
      errors.rank = "Rank is required";
    } else {
      const rankNum = Number(formData.rank);
      if (isNaN(rankNum) || rankNum <= 0) {
        errors.rank = "Please enter a valid rank number";
      } else if (rankNum > 100000000000) {
        errors.rank = "Rank seems too high. Please check and re-enter.";
      }
    }

    // Validate exam type
    if (!formData.examType) {
      errors.examType = "Please select an exam type";
    }

    // Validate home state
    if (!formData.homeState) {
      errors.homeState = "Please select your home state";
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      // setFormErrors(errors);
      showError("Please fill all required fields correctly");

      // Scroll to first error field
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      // Format the data before sending
      const formattedData = {
        firstName: formData.firstName.trim(),
        emailId: formData.emailId.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber,
        rank: Number(formData.rank),
        homeState: formData.homeState,
        examType: formData.examType,
        city: formData.city.trim(),
      };

      console.log("Submitting user data:", formattedData);

      // Save user data and navigate with the data
      const userResult = await dispatch(createUserData(formattedData)).unwrap();

      console.log("User data saved successfully:", userResult);

      if (userResult.success) {
        // showSuccess("Form submitted successfully! Redirecting to predictions...");

        // Navigate to predictions page with form data for API call
        
          navigate('/predict-colleges', {
            state: {
              formData: {
                rank: formattedData.rank,
                typeOfExam: formattedData.examType,
                // year: undefined,
                // round: undefined,
                // branch: undefined,
                // institute: undefined,
                // quota: undefined
              }
            }
          });
       
      }
    } catch (error) {
      console.error("Form submission error:", error);
      const errorMessage = error?.response?.data?.message ||
        error?.message ||
        error?.data?.message ||
        "Failed to submit form. Please try again.";
      showError(errorMessage);
    }
  };

  return (
    <section
      id="predictor"
      className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-violet-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
            College Predictor
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Perfect College
            </span>
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto">
            Enter your details below to get personalized college predictions
          </p>
        </motion.div>

        {/* Predictor Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              {/* Personal Information Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* First Name Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("firstName")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your first name"
                      className={`w-full px-4 py-3 md:py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all ${focusedField === "firstName"
                          ? "border-blue-500 bg-white ring-4 ring-blue-500/10"
                          : formErrors.firstName
                            ? "border-red-500 bg-white ring-4 ring-red-500/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {formErrors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                  )}
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="emailId"
                      value={formData.emailId}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("emailId")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your email"
                      className={`w-full px-4 py-3 md:py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all ${focusedField === "emailId"
                          ? "border-blue-500 bg-white ring-4 ring-blue-500/10"
                          : formErrors.emailId
                            ? "border-red-500 bg-white ring-4 ring-red-500/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {formErrors.emailId && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.emailId}</p>
                  )}
                </div>
              </div>

              {/* Contact and City Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Mobile Number Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("mobileNumber")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter 10-digit mobile number"
                      className={`w-full px-4 py-3 md:py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all ${focusedField === "mobileNumber"
                          ? "border-blue-500 bg-white ring-4 ring-blue-500/10"
                          : formErrors.mobileNumber
                            ? "border-red-500 bg-white ring-4 ring-red-500/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      maxLength="10"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {formErrors.mobileNumber && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.mobileNumber}</p>
                  )}
                </div>

                {/* City Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("city")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your city"
                      className={`w-full px-4 py-3 md:py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all ${focusedField === "city"
                          ? "border-blue-500 bg-white ring-4 ring-blue-500/10"
                          : formErrors.city
                            ? "border-red-500 bg-white ring-4 ring-red-500/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {formErrors.city && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                  )}
                </div>
              </div>

              {/* Rank and Exam Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Rank Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Your Rank <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="rank"
                      value={formData.rank}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("rank")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your rank"
                      className={`w-full px-4 py-3 md:py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all ${focusedField === "rank"
                          ? "border-blue-500 bg-white ring-4 ring-blue-500/10"
                          : formErrors.rank
                            ? "border-red-500 bg-white ring-4 ring-red-500/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      min="1"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <GraduationCap className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {formErrors.rank && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.rank}</p>
                  )}
                </div>

                {/* Exam Select */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Exam <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="examType"
                      value={formData.examType}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("examType")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 md:py-4 bg-gray-50 border-2 rounded-xl text-gray-900 outline-none appearance-none cursor-pointer transition-all ${focusedField === "examType"
                          ? "border-blue-500 bg-white ring-4 ring-blue-500/10"
                          : formErrors.examType
                            ? "border-red-500 bg-white ring-4 ring-red-500/10"
                            : "border-gray-200 hover:border-gray-300"
                        } ${!formData.examType ? "text-gray-400" : ""}`}
                    >
                      <option value="">Select Exam</option>
                      {EXAMS.map((exam) => (
                        <option key={exam.value} value={exam.value}>
                          {exam.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {formErrors.examType && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.examType}</p>
                  )}
                </div>
              </div>

              {/* Home State Row */}
              {/* Home State Row - MODIFIED SECTION */}
              {/* Home State Row - MODIFIED SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Home State Select */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Home State <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="homeState"
                      value={formData.homeState}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("homeState")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 md:py-4 bg-gray-50 border-2 rounded-xl text-gray-900 outline-none appearance-none cursor-pointer transition-all ${focusedField === "homeState"
                          ? "border-blue-500 bg-white ring-4 ring-blue-500/10"
                          : formErrors.homeState
                            ? "border-red-500 bg-white ring-4 ring-red-500/10"
                            : "border-gray-200 hover:border-gray-300"
                        } ${!formData.homeState ? "text-gray-400" : ""}`}
                    >
                      <option value="">Select Home State</option>
                      {STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {formErrors.homeState && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.homeState}</p>
                  )}
                </div>

                {/* Submit Button - ALWAYS ENABLED */}
                <div className="flex items-end">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center justify-center gap-3 py-3 md:py-4 px-6 rounded-xl font-semibold text-base md:text-lg transition-all bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-3"
                        >
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Predicting...
                        </motion.div>
                      ) : (
                        <motion.div
                          key="submit"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-3"
                        >
                          <Search className="h-5 w-5" />
                          Predict Colleges
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>
            </form>

            {/* Info text */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Predictions are based on latest cutoff data. Results are for reference only.
              <span className="text-red-500"> * </span> indicates required fields.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Predictor;