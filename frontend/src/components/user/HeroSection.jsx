import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const [isHovered, setIsHovered] = useState(false);

  // Placeholder image URLs - replace with actual product images
  const mainImage = 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop';
  const productImages = [
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop', // top-left
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop', // top-right
    'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=500&fit=crop', // bottom-left
    'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=500&fit=crop', // bottom-right
  ];

  return (
    <section className="relative w-full min-h-[600px] md:min-h-[700px] bg-[#1a1a1a] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* Left Side - Image Gallery */}
          <div className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center">
            {/* Main Center Image - Product card style: tall, no border-radius */}
            <div
              className="relative z-10 w-[240px] md:w-[300px] aspect-[3/4] overflow-hidden cursor-pointer transition-all duration-500 ease-in-out"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <img
                src={mainImage}
                alt="Main Product"
                className={`w-full h-full object-cover transition-transform duration-500 ease-in-out ${
                  isHovered ? 'scale-105' : 'scale-100'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Top Left Product Image - Starts very far, pulls towards center and comes over main image on hover */}
            <div
              className={`absolute top-0 left-0 md:-left-16 lg:-left-20 w-[140px] md:w-[180px] h-[180px] md:h-[220px] rounded-xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out ${
                isHovered
                  ? 'translate-x-[80px] translate-y-[60px] scale-105 z-20 md:translate-x-[100px] md:translate-y-[80px]'
                  : 'translate-x-0 translate-y-0 scale-100 z-0'
              }`}
            >
              <img
                src={productImages[0]}
                alt="Product 1"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Top Right Product Image - Starts very far, pulls towards center and comes over main image on hover */}
            <div
              className={`absolute top-0 right-0 md:-right-16 lg:-right-20 w-[140px] md:w-[180px] h-[180px] md:h-[220px] rounded-xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out ${
                isHovered
                  ? '-translate-x-[80px] translate-y-[60px] scale-105 z-20 md:-translate-x-[100px] md:translate-y-[80px]'
                  : 'translate-x-0 translate-y-0 scale-100 z-0'
              }`}
            >
              <img
                src={productImages[1]}
                alt="Product 2"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Bottom Left Product Image - Starts very far, pulls towards center and comes over main image on hover */}
            <div
              className={`absolute bottom-0 left-0 md:-left-16 lg:-left-20 w-[140px] md:w-[180px] h-[180px] md:h-[220px] rounded-xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out ${
                isHovered
                  ? 'translate-x-[80px] -translate-y-[60px] scale-105 z-20 md:translate-x-[100px] md:-translate-y-[80px]'
                  : 'translate-x-0 translate-y-0 scale-100 z-0'
              }`}
            >
              <img
                src={productImages[2]}
                alt="Product 3"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Bottom Right Product Image - Starts very far, pulls towards center and comes over main image on hover */}
            <div
              className={`absolute bottom-0 right-0 md:-right-16 lg:-right-20 w-[140px] md:w-[180px] h-[180px] md:h-[220px] rounded-xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out ${
                isHovered
                  ? '-translate-x-[80px] -translate-y-[60px] scale-105 z-20 md:-translate-x-[100px] md:-translate-y-[80px]'
                  : 'translate-x-0 translate-y-0 scale-100 z-0'
              }`}
            >
              <img
                src={productImages[3]}
                alt="Product 4"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="flex flex-col justify-center space-y-6 md:space-y-8 text-white">
            {/* BRAND NEW Label */}
            <div className="inline-flex items-center">
              <span className="px-4 py-1.5 bg-[rgb(72,29,111)] text-white text-xs md:text-sm font-semibold uppercase tracking-wider rounded-full">
                Brand New
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Winter Wear
            </h1>

            {/* Description */}
            <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-md">
              Check out our comfy crewnecks, lightweight khakis, breathable tanktops and more.
            </p>

            {/* Shop Button */}
            <button
              className="group inline-flex items-center gap-2 px-8 py-4 bg-[rgb(72,29,111)] text-white rounded-full font-semibold hover:bg-[#390e60] transition-all duration-300 hover:scale-105 hover:shadow-lg w-fit"
            >
              <span>Shop</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
