import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-background-dark text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-lg mb-8">Page not found</p>
        <Link
          to="/"
          className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;