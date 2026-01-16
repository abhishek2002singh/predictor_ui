import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Loader2, GraduationCap } from "lucide-react";
import { STATES, CATEGORIES, GENDERS } from "../../utils/constants";

const Predictor = () => {
  const [formData, setFormData] = useState({
    rank: "",
    category: "",
    gender: "",
    homeState: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Form submitted:", formData);
    setIsLoading(false);
  };

  const isFormValid =
    formData.rank && formData.category && formData.gender && formData.homeState;

  return (
    <section
      id="predictor"
      className="py-24 bg-linear-to-b from-gray-50 to-white relative overflow-hidden"
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
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
            College Predictor
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your{" "}
            <span className="bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Perfect College
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Enter your details below to get personalized college predictions
            based on your JEE Main rank.
          </p>
        </motion.div>

        {/* Predictor Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rank Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Your JEE Main Rank
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
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all ${
                      focusedField === "rank"
                        ? "border-blue-500 bg-white ring-4 ring-blue-500/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Category and Gender Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 outline-none appearance-none cursor-pointer transition-all ${
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
                      className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 outline-none appearance-none cursor-pointer transition-all ${
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

              {/* Home State Select */}
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
                    className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 outline-none appearance-none cursor-pointer transition-all ${
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

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={!isFormValid || isLoading}
                whileHover={isFormValid && !isLoading ? { scale: 1.01 } : {}}
                whileTap={isFormValid && !isLoading ? { scale: 0.99 } : {}}
                className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                  isFormValid && !isLoading
                    ? "bg-linear-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
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
              Predictions are based on JoSAA 2024 cutoff data. Results are for
              reference only.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Predictor;
