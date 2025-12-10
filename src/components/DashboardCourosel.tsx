import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Slide {
    id: string;
    image: string;
    title: string;
    description: string;
    ctaText?: string;
    ctaLink?: string;
}

interface DashboardCarouselProps {
    slides: Slide[];
    autoPlayInterval?: number;
}

const DashboardCarousel: React.FC<DashboardCarouselProps> = ({
    slides,
    autoPlayInterval = 5000
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, [slides.length]);

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(nextSlide, autoPlayInterval);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide, autoPlayInterval]);

    if (!slides.length) return null;

    return (
        <div
            className="relative w-full overflow-hidden rounded-2xl shadow-xl group h-[280px] mb-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Slides */}
            <div
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div
                        key={slide.id}
                        className="min-w-full h-full relative"
                    >
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                            <div className={`transform transition-all duration-700 delay-100 ${currentIndex === slides.findIndex(s => s.id === slide.id) ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white drop-shadow-md">
                                    {slide.title}
                                </h2>
                                <p className="text-base md:text-lg text-slate-100 mb-4 max-w-2xl drop-shadow-sm line-clamp-2">
                                    {slide.description}
                                </p>
                                {slide.ctaText && (
                                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg flex items-center gap-2 text-sm">
                                        {slide.ctaText}
                                        <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 shadow-lg border border-white/10"
                aria-label="Previous slide"
            >
                <ChevronLeft size={20} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 shadow-lg border border-white/10"
                aria-label="Next slide"
            >
                <ChevronRight size={20} />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${index === currentIndex
                            ? 'bg-white w-8'
                            : 'bg-white/40 hover:bg-white/60 w-1.5'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default DashboardCarousel;

