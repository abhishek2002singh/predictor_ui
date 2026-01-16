import { motion } from "framer-motion";
import { TrendingUp, Users, MapPin, Zap, Shield, BarChart3 } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Smart Predictions",
    description:
      "AI-powered algorithm analyzes your rank against 5+ years of historical cutoff data for accurate predictions.",
    color: "blue",
    gradient: "from-blue-500 to-blue-600",
    bg: "from-blue-50 to-blue-100",
  },
  {
    icon: Users,
    title: "All Categories",
    description:
      "Complete support for General, EWS, OBC-NCL, SC, ST, and all PwD categories with accurate quota calculations.",
    color: "emerald",
    gradient: "from-emerald-500 to-emerald-600",
    bg: "from-emerald-50 to-emerald-100",
  },
  {
    icon: MapPin,
    title: "State Quota",
    description:
      "Home state advantages and domicile benefits automatically calculated for state-wise seat allocation.",
    color: "violet",
    gradient: "from-violet-500 to-violet-600",
    bg: "from-violet-50 to-violet-100",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "Get real-time predictions in milliseconds. No page reloads, no waiting - just instant, accurate results.",
    color: "amber",
    gradient: "from-amber-500 to-amber-600",
    bg: "from-amber-50 to-amber-100",
  },
  {
    icon: Shield,
    title: "Data Privacy",
    description:
      "Your personal data is never stored or shared. We prioritize your privacy with secure, anonymous predictions.",
    color: "rose",
    gradient: "from-rose-500 to-rose-600",
    bg: "from-rose-50 to-rose-100",
  },
  {
    icon: BarChart3,
    title: "Detailed Analysis",
    description:
      "Get comprehensive branch-wise analysis with opening and closing ranks for informed decision making.",
    color: "cyan",
    gradient: "from-cyan-500 to-cyan-600",
    bg: "from-cyan-50 to-cyan-100",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const Features = () => {
  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-violet-100/50 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Students{" "}
            <span className="bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Love Us
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make your college selection journey
            seamless and stress-free.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div
                className={`absolute inset-0 bg-linear-to-br ${feature.bg} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
              <div className="relative bg-white border border-gray-100 rounded-3xl p-8 hover:border-transparent hover:shadow-xl transition-all duration-300">
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br ${feature.gradient} mb-6 shadow-lg`}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover indicator */}
                <div
                  className={`mt-6 flex items-center text-sm font-medium text-${feature.color}-600 opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  Learn more
                  <svg
                    className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
