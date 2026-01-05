import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/user/Navbar';
import Footer from '../../components/user/Footer';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Icon/Illustration */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-[rgba(72,29,111,0.1)] mb-6">
              <AlertCircle className="w-16 h-16 text-[rgb(72,29,111)]" />
            </div>
          </div>

          {/* Error Code */}
          <h1 className="text-8xl md:text-9xl font-bold text-[rgb(72,29,111)] mb-4">
            404
          </h1>

          {/* Error Message */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. Please check the URL and try again.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-[rgb(72,29,111)] text-[rgb(72,29,111)] rounded-full font-semibold hover:bg-[rgba(72,29,111,0.05)] transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[rgb(72,29,111)] text-white rounded-full font-semibold hover:bg-[#390e60] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">You might be looking for:</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/sale"
                className="text-sm text-[rgb(72,29,111)] hover:underline"
              >
                Shop Now
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                to="/about"
                className="text-sm text-[rgb(72,29,111)] hover:underline"
              >
                About Us
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                to="/contact"
                className="text-sm text-[rgb(72,29,111)] hover:underline"
              >
                Contact
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                to="/return-policy"
                className="text-sm text-[rgb(72,29,111)] hover:underline"
              >
                Return Policy
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFoundPage;

