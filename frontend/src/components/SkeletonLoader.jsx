import PropTypes from 'prop-types';

/**
 * Campaign Card Skeleton Loader
 */
export const CampaignCardSkeleton = ({ count = 1 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md"
        >
          {/* Card Header */}
          <div className="p-0">
            <div className="h-[200px] w-full bg-gray-200 animate-pulse" />
          </div>

          {/* Card Body */}
          <div className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between">
                <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-5 w-15 bg-gray-200 rounded-full animate-pulse" />
              </div>

              <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-[90%] bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-[70%] bg-gray-200 rounded animate-pulse" />

              <div>
                <div className="flex justify-between mb-2">
                  <div className="h-3.5 w-25 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3.5 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full animate-pulse" />
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mt-1" />
              </div>

              <div className="flex gap-3">
                <div className="h-3 w-15 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-6 pb-6 pt-0">
            <div className="flex gap-2 w-full">
              <div className="h-8 flex-1 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-8 flex-1 bg-gray-200 rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Campaign List Skeleton Loader
 */
export const CampaignListSkeleton = ({ count = 5 }) => {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex gap-4 items-start">
            <div className="h-20 w-20 bg-gray-200 rounded-md animate-pulse flex-shrink-0" />

            <div className="flex-1 flex flex-col gap-3">
              <div className="flex justify-between">
                <div className="h-5 w-30 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
              </div>

              <div className="h-4.5 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-3.5 w-[80%] bg-gray-200 rounded animate-pulse" />

              <div className="flex gap-4">
                <div className="h-3 w-15 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-17 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Stats Card Skeleton Loader
 */
export const StatsCardSkeleton = ({ count = 4 }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${count} gap-6`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col gap-3 items-center text-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-15 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-25 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Profile Page Skeleton Loader
 */
export const ProfileSkeleton = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex gap-6 items-start">
          <div className="w-25 h-25 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-4">
            <div className="h-8 w-50 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-37 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-4">
              <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-5 w-25 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <StatsCardSkeleton count={3} />

      {/* Content Tabs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col gap-6">
          <div className="flex gap-4">
            <div className="h-8 w-25 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-8 w-30 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
          </div>

          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex gap-4">
                  <div className="h-15 w-15 bg-gray-200 rounded-md animate-pulse flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-4.5 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-3.5 w-[80%] bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-[60%] bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Donation Interface Skeleton Loader
 */
export const DonationSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 items-center text-center">
          <div className="h-6 w-37 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-50 bg-gray-200 rounded animate-pulse" />
        </div>

        <div>
          <div className="h-4 w-25 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
        </div>

        <div>
          <div className="h-4 w-30 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-25 w-full bg-gray-200 rounded-md animate-pulse" />
        </div>

        <div className="flex gap-4">
          <div className="h-10 flex-1 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-10 w-25 bg-gray-200 rounded-md animate-pulse" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="h-3.5 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-3.5 w-[90%] bg-gray-200 rounded animate-pulse" />
          <div className="h-3.5 w-[80%] bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};

/**
 * Generic Table Skeleton Loader
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col gap-4">
        {/* Table Header */}
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-4 flex-1 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>

        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-3.5 flex-1 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Search Results Skeleton Loader
 */
export const SearchSkeleton = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Search Bar */}
      <div className="h-12 w-full bg-gray-200 rounded-md animate-pulse" />

      {/* Filters */}
      <div className="flex gap-4">
        <div className="h-8 w-30 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-8 w-25 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
      </div>

      {/* Results Count */}
      <div className="h-4 w-37 bg-gray-200 rounded animate-pulse" />

      {/* Results Grid */}
      <CampaignCardSkeleton count={6} />
    </div>
  );
};

CampaignCardSkeleton.propTypes = {
  count: PropTypes.number
};

CampaignListSkeleton.propTypes = {
  count: PropTypes.number
};

StatsCardSkeleton.propTypes = {
  count: PropTypes.number
};

TableSkeleton.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number
};

export default {
  CampaignCardSkeleton,
  CampaignListSkeleton,
  StatsCardSkeleton,
  ProfileSkeleton,
  DonationSkeleton,
  TableSkeleton,
  SearchSkeleton
};