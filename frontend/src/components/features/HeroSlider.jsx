import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
    {
        id: 1,
        title: "Next-Gen Gaming",
        subtitle: "Experience the future with RTX 40 Series",
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=1920",
        cta: "Shop Laptops",
        link: "/products?category=LAPTOP",
        color: "from-blue-600/20 to-purple-600/20"
    },
    {
        id: 2,
        title: "Pro-Level Peripherals",
        subtitle: "Elevate your game with precision gear",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1920",
        cta: "Shop Accessories",
        link: "/products",
        color: "from-lime-600/20 to-green-600/20"
    },
    {
        id: 3,
        title: "Build Your Dream Rig",
        subtitle: "Premium components for ultimate performance",
        image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=1920",
        cta: "Shop Components",
        link: "/products?category=GAMING%20LAPTOP",
        color: "from-orange-600/20 to-red-600/20"
    }
];

export const HeroSlider = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="relative h-[500px] w-full overflow-hidden rounded-2xl mb-12 group">
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Overlay Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} mix-blend-multiply`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                        <div className={`transform transition-all duration-700 delay-300 ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                            }`}>
                            <h2 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
                                {slide.title}
                            </h2>
                            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
                                {slide.subtitle}
                            </p>
                            <Link
                                to={slide.link}
                                className="inline-block bg-lime-400 text-navy-950 px-8 py-4 rounded-full font-bold text-lg hover:bg-lime-500 hover:scale-105 transition-all shadow-[0_0_20px_rgba(132,204,22,0.5)]"
                            >
                                {slide.cta}
                            </Link>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-navy-900/80 backdrop-blur-md text-white hover:bg-lime-400 hover:text-navy-950 transition-all hover:scale-110 border border-white/20"
                aria-label="Previous slide"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-navy-900/80 backdrop-blur-md text-white hover:bg-lime-400 hover:text-navy-950 transition-all hover:scale-110 border border-white/20"
                aria-label="Next slide"
            >
                <ChevronRight className="h-6 w-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === current
                            ? 'bg-lime-400 w-8'
                            : 'bg-white/50 hover:bg-white'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};
