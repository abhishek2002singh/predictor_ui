
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Filter, 
  User, 
  Users, 
  Calendar, 
  Hash,
  ChevronDown,
  ChevronUp,
  Building2,
  BookOpen,
  GraduationCap
} from 'lucide-react';

const FilterModalForRankWiseSearch = ({ 
  isOpen, 
  onClose, 
  availableFilters, 
  selectedFilters, 
  onFilterChange,
  onApplyFilters,
  onResetFilters
}) => {
  const [expandedSections, setExpandedSections] = useState({
    category: false,
    gender: false,
    year: false,
    round: false,
    branch: false,
    institute: false,
    quota: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!isOpen) return null;

  // Default filter options if not provided
  const filters = {
    categories: availableFilters?.categories || [
      'GENERAL',
      'EWS',
     
      'OBC-NCL',
     
      'SC',
      
      'ST',
     
    ],
    genders: availableFilters?.genders || [
      'Male',
      'Female-only',
      'Gender-neutral'
    ],
    years: availableFilters?.years || [2026, 2025, 2024, 2023, 2022],
    rounds: availableFilters?.rounds || [1, 2, 3, 4, 5, 6, 7],
    branches: availableFilters?.branches || [
      'Computer Science and Engineering',
      'Electronics and Communication Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Electrical Engineering',
      'Information Technology',
      'Artificial Intelligence',
      'Data Science',
      'Chemical Engineering',
      'Biotechnology',
      'Aerospace Engineering',
      'Automobile Engineering',
      'Instrumentation Engineering',
      'Production Engineering',
      'Textile Engineering',
      'Mining Engineering',
      'Metallurgical Engineering'
    ],
    
   
  };

  // Create safe copies for sorting
  const sortedYears = filters.years ? [...filters.years].sort((a, b) => b - a) : [];
  const sortedRounds = filters.rounds ? [...filters.rounds].sort((a, b) => a - b) : [];
  const sortedBranches = filters.branches ? [...filters.branches].sort() : [];
 

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Advanced Filters</h2>
              <p className="text-sm text-gray-500">Filter colleges by multiple criteria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Filter */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('category')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-600" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Category</h3>
                    <p className="text-sm text-gray-500">
                      {selectedFilters.category === 'all' || !selectedFilters.category 
                        ? 'All Categories' 
                        : selectedFilters.category}
                    </p>
                  </div>
                </div>
                {expandedSections.category ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {expandedSections.category && (
                <div className="p-4 pt-0 border-t">
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => onFilterChange('category', 'all')}
                      className={`w-full text-left px-4 py-3 rounded-lg ${selectedFilters.category === 'all' || !selectedFilters.category 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'hover:bg-gray-50'}`}
                    >
                      All Categories
                    </button>
                    {filters.categories.map((cat, index) => (
                      <button
                        key={index}
                        onClick={() => onFilterChange('category', cat)}
                        className={`w-full text-left px-4 py-3 rounded-lg ${selectedFilters.category === cat 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'hover:bg-gray-50'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Gender Filter */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('gender')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-600" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Gender</h3>
                    <p className="text-sm text-gray-500">
                      {selectedFilters.gender === 'all' || !selectedFilters.gender 
                        ? 'All Genders' 
                        : selectedFilters.gender}
                    </p>
                  </div>
                </div>
                {expandedSections.gender ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {expandedSections.gender && (
                <div className="p-4 pt-0 border-t">
                  <div className="space-y-2">
                    <button
                      onClick={() => onFilterChange('gender', 'all')}
                      className={`w-full text-left px-4 py-3 rounded-lg ${selectedFilters.gender === 'all' || !selectedFilters.gender 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'hover:bg-gray-50'}`}
                    >
                      All Genders
                    </button>
                    {filters.genders.map((gender, index) => (
                      <button
                        key={index}
                        onClick={() => onFilterChange('gender', gender)}
                        className={`w-full text-left px-4 py-3 rounded-lg ${selectedFilters.gender === gender 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'hover:bg-gray-50'}`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Year Filter */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('year')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Year</h3>
                    <p className="text-sm text-gray-500">
                      {selectedFilters.year === 'all' || !selectedFilters.year 
                        ? 'All Years' 
                        : selectedFilters.year}
                    </p>
                  </div>
                </div>
                {expandedSections.year ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {expandedSections.year && (
                <div className="p-4 pt-0 border-t">
                  <div className="space-y-2">
                    <button
                      onClick={() => onFilterChange('year', 'all')}
                      className={`w-full text-left px-4 py-3 rounded-lg ${selectedFilters.year === 'all' || !selectedFilters.year 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'hover:bg-gray-50'}`}
                    >
                      All Years
                    </button>
                    {sortedYears.map((year, index) => (
                      <button
                        key={index}
                        onClick={() => onFilterChange('year', year)}
                        className={`w-full text-left px-4 py-3 rounded-lg ${selectedFilters.year === year 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'hover:bg-gray-50'}`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Round Filter */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('round')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-gray-600" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Round</h3>
                    <p className="text-sm text-gray-500">
                      {selectedFilters.round === 'all' || !selectedFilters.round 
                        ? 'All Rounds' 
                        : `Round ${selectedFilters.round}`}
                    </p>
                  </div>
                </div>
                {expandedSections.round ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {expandedSections.round && (
                <div className="p-4 pt-0 border-t">
                  <div className="space-y-2">
                    <button
                      onClick={() => onFilterChange('round', 'all')}
                      className={`w-full text-left px-4 py-3 rounded-lg ${selectedFilters.round === 'all' || !selectedFilters.round 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'hover:bg-gray-50'}`}
                    >
                      All Rounds
                    </button>
                    {sortedRounds.map((round, index) => (
                      <button
                        key={index}
                        onClick={() => onFilterChange('round', round)}
                        className={`w-full text-left px-4 py-3 rounded-lg ${selectedFilters.round === round 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'hover:bg-gray-50'}`}
                      >
                        Round {round}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Branch/Program Filter */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('branch')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-gray-600" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Branch/Program</h3>
                    <p className="text-sm text-gray-500">
                      {selectedFilters.branch === 'all' || !selectedFilters.branch 
                        ? 'All Branches' 
                        : selectedFilters.branch}
                    </p>
                  </div>
                </div>
                {expandedSections.branch ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {expandedSections.branch && (
                <div className="p-4 pt-0 border-t">
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => onFilterChange('branch', 'all')}
                      className={`w-full text-left px-4 py-3 rounded-lg ${selectedFilters.branch === 'all' || !selectedFilters.branch 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'hover:bg-gray-50'}`}
                    >
                      All Branches
                    </button>
                    {sortedBranches.map((branch, index) => (
                      <button
                        key={index}
                        onClick={() => onFilterChange('branch', branch)}
                        className={`w-full text-left px-4 py-3 rounded-lg ${selectedFilters.branch === branch 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'hover:bg-gray-50'}`}
                      >
                        {branch}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Institute Filter */}
           

            
          </div>

          {/* Active Filters Display */}
          {Object.values(selectedFilters).some(v => v !== 'all' && v !== undefined) && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Active Filters</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedFilters)
                  .filter(([_, value]) => value !== 'all' && value !== undefined)
                  .map(([key, value]) => (
                    <span 
                      key={key} 
                      className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      {key}: {value}
                      <button
                        onClick={() => onFilterChange(key, 'all')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t">
          <div className="flex gap-3">
            <button
              onClick={onResetFilters}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Reset All
            </button>
            <button
              onClick={onApplyFilters}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FilterModalForRankWiseSearch;