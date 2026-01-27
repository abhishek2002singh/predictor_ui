


import { Home, School, Search, ChevronDown, Filter, Loader2, AlertCircle } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from "framer-motion";
import { jeeAllCollege, AllCouncilling } from '../../utils/jeeAllCollege';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRankPrediction, clearRankPrediction } from '../../slice/rankPredictionSlice';
import { toast } from 'react-toastify';

const PredictRank = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { predictionData, loading, error } = useSelector(state => state.rankPrediction)
    
    const [collegeName, setCollegeName] = useState('')
    const [filteredColleges, setFilteredColleges] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [selectedCollege, setSelectedCollege] = useState(null)
    const [selectedCounseling, setSelectedCounseling] = useState('')
    const [focusedField, setFocusedField] = useState(null)
    const dropdownRef = useRef(null)
    const inputRef = useRef(null)

    // Check if data exists and has proper structure
    const hasValidPredictionData = predictionData && predictionData.success && predictionData.result
    
    useEffect(() => {
        if (collegeName.trim() === '') {
            setFilteredColleges([])
            return
        }
        
        const searchTerm = collegeName.toLowerCase().trim()
        const filtered = jeeAllCollege.filter(college => {
            return (
                college.fullName.toLowerCase().includes(searchTerm) ||
                college.shortName.toLowerCase().includes(searchTerm) ||
                college.type.toLowerCase().includes(searchTerm) ||
                (searchTerm.includes('iit') && college.type === 'IIT') ||
                (searchTerm.includes('nit') && college.type === 'NIT') ||
                (searchTerm.includes('iiit') && college.type === 'IIIT') ||
                (searchTerm.includes('gfti') && college.type === 'GFTI')
            )
        })
        setFilteredColleges(filtered.slice(0, 8))
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

    const handleCollegeSelect = (college) => {
        setCollegeName(college.fullName)
        setSelectedCollege(college)
        setShowDropdown(false)
        setFocusedField("collegeName")
    }

    const handleClear = () => {
        setCollegeName('')
        setSelectedCollege(null)
        setFilteredColleges([])
        setShowDropdown(false)
        dispatch(clearRankPrediction())
    }

    const getCounselingName = (id) => {
        const counseling = AllCouncilling.find(c => c.id === id)
        return counseling ? counseling.name : ''
    }

    const handlePredictRank = async () => {
        if (!selectedCollege || !selectedCounseling) {
            toast.error('Please select both college and counseling type')
            return
        }

        const predictionData = {
            institute: selectedCollege.fullName,
            CounselingType: selectedCounseling
        }

        try {
            await dispatch(fetchRankPrediction(predictionData)).unwrap()
            toast.success('Rank prediction fetched successfully!')
        } catch (error) {
            // Handle different error formats
            const errorMessage = error?.message || error?.data?.message || error || 'Failed to fetch rank prediction'
            toast.error(errorMessage)
        }
    }

    const getCounselingDetails = (id) => {
        return AllCouncilling.find(c => c.id === id) || null
    }

    // Clear error on component mount
    useEffect(() => {
        dispatch(clearRankPrediction())
    }, [dispatch])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
            {/* Back Button */}
            <div className="max-w-7xl mx-auto mb-10">
                <button
                    onClick={() => navigate('/')}
                    className="flex mt-10 items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors hover:cursor-pointer"
                >
                    <Home className="h-4 w-4" />
                    Back to Predictor
                </button>
            
                {/* Header */}
                <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="mb-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mx-auto mb-6 flex items-center justify-center">
                        <School className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">College Rank Predictor</h1>
                    <p className="text-gray-600">Find rank requirements for colleges</p>
                </motion.div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto space-y-8">
                    
                    {/* College Search */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                        <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-blue-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500 rounded-lg">
                                    <Search className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Search College</h2>
                                    <p className="text-sm text-gray-500">{jeeAllCollege.length}+ colleges</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-700">College Name</label>
                                    <div className="relative" ref={inputRef}>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={collegeName}
                                            onChange={(e) => {
                                                setCollegeName(e.target.value)
                                                setShowDropdown(true)
                                                setSelectedCollege(null)
                                                dispatch(clearRankPrediction())
                                            }}
                                            onFocus={() => {
                                                setShowDropdown(true)
                                                setFocusedField("collegeName")
                                            }}
                                            placeholder="Search colleges..."
                                            className={`w-full px-5 py-3.5 bg-white border-2 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all ${
                                                focusedField === "collegeName"
                                                    ? "border-blue-500 shadow-lg"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                                            {collegeName && (
                                                <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm">
                                                    Clear
                                                </button>
                                            )}
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>

                                    {showDropdown && filteredColleges.length > 0 && (
                                        <div ref={dropdownRef} className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-xl border max-h-64 overflow-y-auto">
                                            <div className="p-2">
                                                {filteredColleges.map((college) => (
                                                    <div key={college.id} onClick={() => handleCollegeSelect(college)} className="px-4 py-3 hover:bg-blue-50 cursor-pointer rounded-lg mb-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium text-gray-900">{college.fullName}</div>
                                                                <div className="text-sm text-gray-500">{college.shortName}</div>
                                                            </div>
                                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ml-3 ${
                                                                college.type === 'IIT' ? 'bg-red-50 text-red-700' :
                                                                college.type === 'NIT' ? 'bg-blue-50 text-blue-700' :
                                                                college.type === 'IIIT' ? 'bg-green-50 text-green-700' :
                                                                'bg-purple-50 text-purple-700'
                                                            }`}>
                                                                {college.type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {selectedCollege && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-blue-500 rounded-lg">
                                                    <School className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{selectedCollege.fullName}</h3>
                                                    <div className="flex gap-2 mt-2">
                                                        <span className="px-3 py-1.5 bg-white text-blue-600 text-sm rounded-lg border">{selectedCollege.shortName}</span>
                                                        <span className={`px-3 py-1.5 text-sm rounded-lg border ${
                                                            selectedCollege.type === 'IIT' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            selectedCollege.type === 'NIT' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            selectedCollege.type === 'IIIT' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            'bg-purple-50 text-purple-700 border-purple-200'
                                                        }`}>
                                                            {selectedCollege.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={handleClear} className="text-gray-500 hover:text-gray-700 px-3 py-2 hover:bg-white rounded-lg text-sm border">
                                                Change
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Counseling Selection */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                        <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-purple-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500 rounded-lg">
                                    <Filter className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Counseling Selection</h2>
                                    <p className="text-sm text-gray-500">Choose admission process</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-gray-700">Counseling Type</label>
                                    <div className="relative">
                                        <select
                                            value={selectedCounseling}
                                            onChange={(e) => {
                                                setSelectedCounseling(e.target.value)
                                                dispatch(clearRankPrediction())
                                            }}
                                            className="w-full px-5 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 outline-none transition-all hover:border-gray-300 focus:border-purple-500 focus:shadow-lg"
                                            disabled={!selectedCollege}
                                        >
                                            <option value="">Select Counseling</option>
                                            {AllCouncilling.map((counseling) => (
                                                <option key={counseling.id} value={counseling.id}>{counseling.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {selectedCounseling && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-500 rounded-lg">
                                                    <Filter className="h-4 w-4 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">Selected Counseling</h3>
                                                    <p className="text-purple-700 font-semibold">{getCounselingName(selectedCounseling)}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => {
                                                setSelectedCounseling('')
                                                dispatch(clearRankPrediction())
                                            }} className="text-gray-500 hover:text-gray-700 px-3 py-2 hover:bg-white rounded-lg text-sm border">
                                                Change
                                            </button>
                                        </div>
                                        
                                        {getCounselingDetails(selectedCounseling) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-purple-200">
                                                <div>
                                                    <span className="text-xs text-gray-500">Type</span>
                                                    <p className="text-sm font-medium">{getCounselingDetails(selectedCounseling).type}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Exams</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {getCounselingDetails(selectedCounseling).exams.map((exam, idx) => (
                                                            <span key={idx} className="px-3 py-1 text-xs bg-white text-purple-700 rounded-lg border">
                                                                {exam}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Error Display */}
                                {error && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="h-5 w-5 text-red-500" />
                                            <div>
                                                <h4 className="font-medium text-red-700">Error</h4>
                                                <p className="text-sm text-red-600">{typeof error === 'object' ? JSON.stringify(error) : error}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {selectedCollege && selectedCounseling && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 border-t">
                                        <button 
                                            onClick={handlePredictRank}
                                            disabled={loading}
                                            className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 shadow-lg flex items-center justify-center gap-2 ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    Predicting...
                                                </>
                                            ) : (
                                                'Predict Required Rank'
                                            )}
                                        </button>
                                        <p className="text-center text-sm text-gray-500 mt-3">Get predictions based on historical data</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Results Display - FIXED */}
                    {hasValidPredictionData && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                            <div className="p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500 rounded-lg">
                                        <School className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Prediction Results</h2>
                                        <p className="text-sm text-gray-500">Based on historical cutoff data</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="space-y-6">
                                    {/* Summary */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                            <div className="text-2xl font-bold text-blue-700">
                                                {predictionData.result?.rankRange?.bestOpeningRank?.toLocaleString() || 'N/A'}
                                            </div>
                                            <div className="text-sm text-blue-600 mt-1">Best Opening Rank</div>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                            <div className="text-2xl font-bold text-green-700">
                                                {predictionData.result?.rankRange?.worstClosingRank?.toLocaleString() || 'N/A'}
                                            </div>
                                            <div className="text-sm text-green-600 mt-1">Worst Closing Rank</div>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                                            <div className="text-2xl font-bold text-purple-700">
                                                {predictionData.result?.totalRecords || 0}
                                            </div>
                                            <div className="text-sm text-purple-600 mt-1">Data Records</div>
                                        </div>
                                    </div>

                                    {/* Institute Info */}
                                    <div className="bg-gray-50 p-4 rounded-xl border">
                                        <h3 className="font-semibold text-gray-900 mb-2">Institute Information</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Institute</span>
                                                <span className="font-medium text-gray-900 text-right">
                                                    {predictionData.result?.institute || selectedCollege?.fullName}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Counseling Type</span>
                                                <span className="font-medium text-gray-900">
                                                    {predictionData.result?.counseling || getCounselingName(selectedCounseling)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Data Preview with Safety Check */}
                                    {predictionData.result?.data && predictionData.result.data.length > 0 ? (
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-3">Latest Cutoff Data</h3>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead>
                                                        <tr className="bg-gray-50">
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Year</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Round</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Opening Rank</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Closing Rank</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {predictionData.result.data.slice(0, 3).map((item, index) => (
                                                            <tr key={index} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-sm">{item.year || 'N/A'}</td>
                                                                <td className="px-4 py-3 text-sm">Round {item.round || 'N/A'}</td>
                                                                <td className="px-4 py-3 text-sm font-medium">
                                                                    {(item.openingRank || 0).toLocaleString()}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm font-medium">
                                                                    {(item.closingRank || 0).toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {predictionData.result.data.length > 3 && (
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Showing 3 of {predictionData.result.totalRecords} records
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500">No detailed cutoff data available</p>
                                        </div>
                                    )}

                                    {/* Message from API */}
                                    {predictionData.message && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                            <p className="text-sm text-blue-700">{predictionData.message}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-1">How it works</h4>
                                <p className="text-sm text-gray-600">
                                    This predictor analyzes historical JoSAA cutoff data to provide rank ranges. 
                                    For accurate predictions, ensure you select both college and counseling type.
                                    Currently supporting only JoSAA counseling.
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