import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-background-base text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-6xl font-display mb-4">404</h1>
        <p className="text-lg text-text-secondary mb-8">Page not found</p>
        <Link
          to="/"
          className="inline-block bg-white text-black px-6 py-3 font-semibold rounded-sm hover:-translate-y-px hover:shadow-btn-hover transition-all duration-600 ease-gravity"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;