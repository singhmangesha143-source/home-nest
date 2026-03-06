import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[80vh] flex items-center justify-center fade-in">
    <div className="text-center">
      <h1 className="text-8xl font-extrabold text-primary-600 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Oops! Page not found.</p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  </div>
);

export default NotFound;
