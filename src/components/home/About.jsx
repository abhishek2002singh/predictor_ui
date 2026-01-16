import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

const benefits = [
  "Accurate predictions based on 5+ years of JoSAA data",
  "Support for all IITs, NITs, IIITs and GFTIs",
  "Real-time updates with latest counselling data",
  "Category and state quota aware predictions",
  "Free to use with no registration required",
  "Mobile-friendly responsive design",
];

const About = () => {
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              About Us
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Making College Admissions{" "}
              <span className="bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Predictable
              </span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Our platform leverages advanced algorithms and comprehensive
              historical data to provide accurate college admission predictions.
              We analyze multiple factors including your rank, category, gender,
              and home state to give you personalized recommendations.
            </p>

            {/* Benefits List */}
            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-700">{benefit}</span>
                </motion.li>
              ))}
            </ul>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const element = document.getElementById("predictor");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
            >
              Try Predictor Now
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </motion.div>

          {/* Right Content - Stats Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-100 to-violet-100 rounded-3xl transform rotate-3" />

            <div className="relative bg-white rounded-3xl shadow-xl p-8 md:p-10">
              <div className="grid grid-cols-2 gap-6">
                {[
                  {
                    value: "50,000+",
                    label: "Students Helped",
                    color: "blue",
                  },
                  {
                    value: "500+",
                    label: "Colleges Covered",
                    color: "violet",
                  },
                  {
                    value: "95%",
                    label: "Accuracy Rate",
                    color: "emerald",
                  },
                  {
                    value: "10K+",
                    label: "Daily Predictions",
                    color: "amber",
                  },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className={`bg-${stat.color}-50 rounded-2xl p-6 text-center`}
                  >
                    <div
                      className={`text-3xl md:text-4xl font-bold text-${stat.color}-600 mb-2`}
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Testimonial */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <p className="text-gray-600 italic mb-4">
                  "This predictor helped me make an informed decision about my
                  college choices. The predictions were surprisingly accurate!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold">
                    R
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Rahul Sharma
                    </div>
                    <div className="text-sm text-gray-500">
                      IIT Delhi, CSE 2024
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
