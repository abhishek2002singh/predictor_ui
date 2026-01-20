

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  ChevronDown, 
  Loader2, 
  GraduationCap, 
  Phone 
} from "lucide-react";
import { STATES, CATEGORIES, GENDERS } from "../../utils/constants";
import { createUserData, fetchCutoffs } from "../../slice/predictorSlice";

const EXAMS = [
  { value: "JEE_MAINS", label: "JEE Mains" },
  { value: "JEE_ADVANCED", label: "JEE Advanced" },
];

const Predictor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.predictor);
  
  const [formData, setFormData] = useState({
    rank: "",
    examType: "",
    category: "",
    gender: "",
    homeState: "",
    mobileNumber: "",
  });
  const [focusedField, setFocusedField] = useState(null);
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      setFormError("Please fill all required fields");
      return;
    }

    try {
      // First, save user data
      const userResult = await dispatch(createUserData(formData)).unwrap();
      
      if (userResult.success) {
        // Then fetch cutoffs with user data
        const params = {
          rank: formData.rank,
          category: formData.category,
          gender: formData.gender,
          typeOfExam: formData.examType,
          page: 1,
          limit: 3 // Initial limit for first page
        };
        
        const cutoffResult = await dispatch(fetchCutoffs(params)).unwrap();
        
        if (cutoffResult.success) {
          // Navigate to predictions page
          navigate('/predict-colleges', { 
            state: { 
              userData: userResult.data,
              initialCutoffs: cutoffResult.data 
            }
          });
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setFormError(error.message || "Failed to submit form. Please try again.");
    }
  };

  const isFormValid = 
    formData.rank &&
    formData.examType && 
    formData.category && 
    formData.gender &&
    formData.homeState && 
    formData.mobileNumber;

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

        {/* Error Message */}
        {formError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-red-600 text-sm font-medium">{formError}</p>
          </motion.div>
        )}

        {/* Predictor Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              {/* Rank and Exam Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Rank Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Your Rank
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="rank"
                      value={formData.rank}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("rank")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your rank (e.g., 15000)"
                      className={`w-full px-4 py-3 md:py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all ${
                        focusedField === "rank"
                          ? "border-blue-500 bg-white ring-4 ring-blue-500/10"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      required
                      min="1"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <GraduationCap className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Exam Select */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Exam
                  </label>
                  <div className="relative">
                    <select
                      name="examType"
                      value={formData.examType}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("examType")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 md:py-4 bg-gray-50 border-2 rounded-xl text-gray-900 outline-none appearance-none cursor-pointer transition-all ${
                        focusedField === "examType"
                          ? "border-blue-500 bg-white ring-4 ring-blue-500/10"
                          : "border-gray-200 hover:border-gray-300"
                      } ${!formData.examType ? "text-gray-400" : ""}`}
                      required
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
                </div>
              </div>

              {/* Category and Gender Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Category Select */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("category")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 md:py-4 bg-gray-50 border-2 rounded-xl text-gray-900 outline-none appearance-none cursor-pointer transition-all ${
                        focusedField === "category"
                          ? "border-blue-500 bg-white ring-4 ring-blue-500/10"
                          : "border-gray-200 hover:border-gray-300"
                      } ${!formData.category ? "text-gray-400" : ""}`}
                      required
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Gender Select */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("gender")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 md:py-4 bg-gray-50 border-2 rounded-xl text-gray-900 outline-none appearance-none cursor-pointer transition-all ${
                        focusedField === "gender"
                          ? "border-blue-500 bg-white ring-4 ring-blue-500/10"
                          : "border-gray-200 hover:border-gray-300"
                      } ${!formData.gender ? "text-gray-400" : ""}`}
                      required
                    >
                      <option value="">Select Gender</option>
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Home State and Mobile Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Home State
                  </label>
                  <div className="relative">
                    <select
                      name="homeState"
                      value={formData.homeState}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("homeState")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-4 py-3 md:py-4 bg-gray-50 border-2 rounded-xl text-gray-900 outline-none appearance-none cursor-pointer transition-all ${
                        focusedField === "homeState"
                          ? "border-blue-500 bg-white ring-4 ring-blue-500/10"
                          : "border-gray-200 hover:border-gray-300"
                      } ${!formData.homeState ? "text-gray-400" : ""}`}
                      required
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
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("mobileNumber")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your mobile number"
                      className={`w-full px-4 py-3 md:py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all ${
                        focusedField === "mobileNumber"
                          ? "border-blue-500 bg-white ring-4 ring-blue-500/10"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      required
                      pattern="[6-9][0-9]{9}"
                      maxLength="10"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={!isFormValid || loading}
                whileHover={isFormValid && !loading ? { scale: 1.01 } : {}}
                whileTap={isFormValid && !loading ? { scale: 0.99 } : {}}
                className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                  isFormValid && !loading
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
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
            </form>

            {/* Info text */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Predictions are based on latest cutoff data. Results are for reference only.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Predictor;