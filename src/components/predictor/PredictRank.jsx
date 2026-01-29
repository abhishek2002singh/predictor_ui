
import { Home, School, Search, ChevronDown, AlertCircle, X } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from "framer-motion";
import { jeeAllCollege, AllCouncilling } from '../../utils/jeeAllCollege';

import {showWarning , showInfo , showError} from '../../utils/toast'


const PredictRank = () => {
    const navigate = useNavigate()
    
    const [collegeName, setCollegeName] = useState('')
    const [filteredColleges, setFilteredColleges] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [selectedCollege, setSelectedCollege] = useState(null)
    const [selectedCounseling, setSelectedCounseling] = useState('')
    const dropdownRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        if (collegeName.trim() === '') {
            setFilteredColleges([])
            return
        }
        
        const searchTerm = collegeName.toLowerCase().trim()
        const filtered = jeeAllCollege.filter(college => {
            const fullNameMatch = college.fullName.toLowerCase().includes(searchTerm)
            const shortNameMatch = college.shortName.toLowerCase().includes(searchTerm)
            const typeMatch = college.type.toLowerCase().includes(searchTerm)
            
            // Exact type keyword matches (order matters - check IIIT before IIT)
            const iiitMatch = searchTerm.includes('iiit') && college.type === 'IIIT'
            const iitMatch = searchTerm.includes('iit') && !searchTerm.includes('iiit') && college.type === 'IIT'
            const nitMatch = searchTerm.includes('nit') && !searchTerm.includes('iiit') && college.type === 'NIT'
            const gftiMatch = searchTerm.includes('gfti') && college.type === 'GFTI'
            
            return fullNameMatch || shortNameMatch || typeMatch || iiitMatch || iitMatch || nitMatch || gftiMatch
        })
        
        // Sort results: exact matches first, then partial matches
        const sortedFiltered = filtered.sort((a, b) => {
            const aExactMatch = a.fullName.toLowerCase() === searchTerm || a.shortName.toLowerCase() === searchTerm
            const bExactMatch = b.fullName.toLowerCase() === searchTerm || b.shortName.toLowerCase() === searchTerm
            
            if (aExactMatch && !bExactMatch) return -1
            if (!aExactMatch && bExactMatch) return 1
            
            const aStartsWith = a.fullName.toLowerCase().startsWith(searchTerm) || a.shortName.toLowerCase().startsWith(searchTerm)
            const bStartsWith = b.fullName.toLowerCase().startsWith(searchTerm) || b.shortName.toLowerCase().startsWith(searchTerm)
            
            if (aStartsWith && !bStartsWith) return -1
            if (!aStartsWith && bStartsWith) return 1
            
            return 0
        })
        
        setFilteredColleges(sortedFiltered.slice(0, 8))
    }, [collegeName])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    console.log(selectedCounseling)

    const validateCollegeForCounseling = (college, counselingId) => {

       console.log(counselingId)
      console.log(college)
        // JoSAA only supports IIT, NIT, IIIT
        if (counselingId === 'JoSAA') {
            showInfo('hello')
            if (!jeeAllCollege.includes(college.type)) {
               
                showError(`${college.shortName} does not support JoSAA counseling. Please select an IIT, NIT, or IIIT college.`)
            }
        }
        
        // CSAB supports NITs, IIITs, and GFTIs (not IITs)
        if (counselingId === 'CSAB') {
            if (college.type === 'IIT') {
                

                showError(`${college.shortName} does not support CSAB counseling. Please select a NIT, IIIT, or GFTI college.`)
            }
        }
        
        return true
    }

    const handleCollegeSelect = (college) => {
        setCollegeName(college.fullName)
        setSelectedCollege(college)
        setShowDropdown(false)
        
        // Validate if college is supported by selected counseling
        if (selectedCounseling) {
            validateCollegeForCounseling(college, selectedCounseling)
        }
    }

    const handleClear = () => {
        setCollegeName('')
        setSelectedCollege(null)
        setFilteredColleges([])
        setShowDropdown(false)
    }

    const handleCounselingChange = (counselingId) => {
        setSelectedCounseling(counselingId)
        
        // Validate existing college selection if any
        if (selectedCollege) {
            validateCollegeForCounseling(selectedCollege, counselingId)
        }
    }

   

    const getCounselingName = (id) => {
        const counseling = AllCouncilling.find(c => c.id === id)
        return counseling ? counseling.name : ''
    }

    const handlePredictRank = () => {
        if (!selectedCounseling) {
            

            showError('Please select a counseling type')
        }

        if (!selectedCollege) {
           

            showError('Please select a college')
        }

        // Final validation before navigation
        if (!validateCollegeForCounseling(selectedCollege, selectedCounseling)) {
            return
        }

        if (selectedCollege && selectedCounseling) {
            navigate('/rank-prediction-results', {
            state: {
                collegeName: selectedCollege?.fullName,
                collegeId: selectedCollege?.id,
                counselingType: selectedCounseling,
                counselingName: getCounselingName(selectedCounseling),
                collegeType: selectedCollege?.type,
                collegeShortName: selectedCollege?.shortName
            }
        })
        }

        
    }

    return (
        <div className="min-h-screen bg-gray-50 py-20 sm:py-20 px-4">
           
            <div className="max-w-3xl mx-auto ">
                {/* Header */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 sm:mb-8 transition-colors "
                >
                    <Home className="h-4 w-4" />
                    <span className="text-sm sm:text-base">Back to Home</span>
                </button>
            
                {/* Title */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-xl mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                        <School className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">College Rank Predictor</h1>
                    <p className="text-sm sm:text-base text-gray-600">Find rank requirements for your target college</p>
                </div>

                {/* Main Form */}
                <div className="space-y-4 sm:space-y-6">
                    
                    {/* Counseling Selection Card - STEP 1 */}
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-md border border-gray-200 p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Step 1: Select Counseling Type</h2>
                        
                        <div className="space-y-4">
                            <div className="relative">
                                <select
                                    value={selectedCounseling}
                                    onChange={(e) => handleCounselingChange(e.target.value)}
                                    className="w-full px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none appearance-none text-sm sm:text-base"
                                >
                                    <option value="">Select Counseling Type</option>
                                    {AllCouncilling.map((counseling) => (
                                        <option key={counseling.id} value={counseling.id}>{counseling.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>

                            {selectedCounseling && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }} 
                                    animate={{ opacity: 1, scale: 1 }} 
                                    className="bg-green-50 border-2 border-green-200 rounded-lg p-3 sm:p-4"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words flex-1">
                                            Selected: {getCounselingName(selectedCounseling)}
                                        </h3>
                                        <button 
                                            onClick={() => setSelectedCounseling('')} 
                                            className="text-gray-600 hover:text-gray-900 text-sm px-3 py-1.5 border border-gray-300 rounded hover:bg-white whitespace-nowrap flex-shrink-0"
                                        >
                                            Change
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* College Search Card - STEP 2 */}
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-md border border-gray-200 p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Step 2: Select College</h2>
                        
                        <div className="space-y-4">
                            {/* Search Input */}
                            <div className="relative">
                                <div ref={inputRef}>
                                    <input
                                        type="text"
                                        value={collegeName}
                                        onChange={(e) => {
                                            setCollegeName(e.target.value)
                                            setSelectedCollege(null)
                                            
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        placeholder="Type college name (e.g., IIT Bombay)"
                                        className="w-full px-4 py-2.5 sm:py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        disabled={!selectedCounseling}
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        {collegeName && (
                                            <button 
                                                onClick={handleClear} 
                                                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Dropdown */}
                                {showDropdown && filteredColleges.length > 0 && (
                                    <div ref={dropdownRef} className="relative z-20 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 sm:max-h-80 overflow-y-auto">
                                        {filteredColleges.map((college) => (
                                            <div 
                                                key={college.id} 
                                                onClick={() => handleCollegeSelect(college)} 
                                                className="px-3 sm:px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-gray-900 text-sm sm:text-base line-clamp-1">{college.fullName}</div>
                                                        <div className="text-xs sm:text-sm text-gray-500">{college.shortName}</div>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded whitespace-nowrap flex-shrink-0 ${
                                                        college.type === 'IIT' ? 'bg-red-100 text-red-700' :
                                                        college.type === 'NIT' ? 'bg-blue-100 text-blue-700' :
                                                        college.type === 'IIIT' ? 'bg-green-100 text-green-700' :
                                                        'bg-purple-100 text-purple-700'
                                                    }`}>
                                                        {college.type}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                           

                            {/* Selected College */}
                            {selectedCollege && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 sm:p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 break-words">{selectedCollege.fullName}</h3>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-2 sm:px-3 py-1 bg-white text-blue-600 text-xs sm:text-sm rounded border border-blue-200">
                                                    {selectedCollege.shortName}
                                                </span>
                                                <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                                                    selectedCollege.type === 'IIT' ? 'bg-red-100 text-red-700' :
                                                    selectedCollege.type === 'NIT' ? 'bg-blue-100 text-blue-700' :
                                                    selectedCollege.type === 'IIIT' ? 'bg-green-100 text-green-700' :
                                                    'bg-purple-100 text-purple-700'
                                                }`}>
                                                    {selectedCollege.type}
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleClear} 
                                            className="text-gray-600 hover:text-gray-900 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-white whitespace-nowrap flex-shrink-0"
                                        >
                                            Change
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                   
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <button 
                           
                                onClick={handlePredictRank}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-lg transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
                            >
                                Predict Required Rank
                            </button>
                            <p className="text-center text-xs sm:text-sm text-gray-500 mt-2">Based on historical cutoff data</p>
                        </motion.div>
                  

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">How it works</h4>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    First select your counseling type, then search for your college. The system will validate if your selected college supports the chosen counseling process.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PredictRank