import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBatchOperations } from '../contexts/BatchOperationsContext';
import { getVersionInfo, formatVersion } from '../utils/contractVersion';
import { CheckCircle, X, Info } from 'lucide-react';

const VersionBanner = () => {
  const { getContractVersion, isBatchOperationsAvailable } = useBatchOperations();
  
  const [version, setVersion] = useState(null);
  const [batchAvailable, setBatchAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the banner
    const isDismissed = localStorage.getItem('versionBannerDismissed');
    if (isDismissed === 'true') {
      setDismissed(true);
      setLoading(false);
      return;
    }

    // Detect contract version
    const detectVersion = async () => {
      try {
        const detectedVersion = await getContractVersion();
        setVersion(detectedVersion);
        
        const batchOpsAvailable = await isBatchOperationsAvailable();
        setBatchAvailable(batchOpsAvailable);
      } catch (error) {
        console.error('Error detecting version:', error);
        // Default to V1 if detection fails
        setVersion(1);
        setBatchAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    detectVersion();
  }, [getContractVersion, isBatchOperationsAvailable]);

  const handleDismiss = () => {
    localStorage.setItem('versionBannerDismissed', 'true');
    setDismissed(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (loading || dismissed || !batchAvailable || version < 2) {
    return null;
  }

  const versionInfo = getVersionInfo(version);

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5" />
              <div>
                <p className="font-semibold">Banner Dismissed</p>
                <p className="text-sm text-blue-100">You can always find batch operations in the dashboard menu</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="sticky top-0 z-40 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-blue-200 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  🎉 New Features Available!
                  <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md">
                    {formatVersion(version)}
                  </span>
                </h3>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors duration-200 text-gray-600 hover:text-gray-900"
              aria-label="Dismiss banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <p className="text-gray-700 text-base">
              DotNation has been upgraded with powerful batch operations and scalability improvements!
            </p>

            {/* Features List */}
            <div>
              <p className="font-bold text-gray-900 mb-3">What&apos;s New:</p>
              <ul className="space-y-2">
                {versionInfo.improvements.map((improvement, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 text-sm text-gray-700"
                  >
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{improvement}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/batch-create"
                className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                Try Batch Campaign Creator
              </Link>
              <Link
                to="/batch-withdraw"
                className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                Batch Withdraw Funds
              </Link>
              <button
                onClick={handleDismiss}
                className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default VersionBanner;
