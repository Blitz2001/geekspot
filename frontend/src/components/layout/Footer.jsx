import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-navy-900 border-t border-navy-800 mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <h3 className="text-2xl font-bold text-lime-400 mb-4">GEEKSPOT</h3>
                        <p className="text-gray-400 text-sm">
                            Your one-stop shop for gaming laptops, PC components, and tech accessories.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/products" className="text-gray-400 hover:text-lime-400 transition-colors text-sm">
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link to="/categories" className="text-gray-400 hover:text-lime-400 transition-colors text-sm">
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <Link to="/deals" className="text-gray-400 hover:text-lime-400 transition-colors text-sm">
                                    Deals
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-gray-400 hover:text-lime-400 transition-colors text-sm">
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Customer Service</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/support" className="text-gray-400 hover:text-lime-400 transition-colors text-sm">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/shipping" className="text-gray-400 hover:text-lime-400 transition-colors text-sm">
                                    Shipping Info
                                </Link>
                            </li>
                            <li>
                                <Link to="/returns" className="text-gray-400 hover:text-lime-400 transition-colors text-sm">
                                    Returns
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-gray-400 hover:text-lime-400 transition-colors text-sm">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Follow Us</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-lime-400 transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-lime-400 transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-lime-400 transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-lime-400 transition-colors">
                                <Youtube className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-navy-800 mt-8 pt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        © 2024 Geekspot. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
