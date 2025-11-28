import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, ChevronDown, ChevronRight, MessageCircle } from 'lucide-react';

export const Support = () => {
    const [expandedFaq, setExpandedFaq] = useState(null);

    const faqs = [
        {
            question: "How do I track my order?",
            answer: "You can track your order by visiting our Track Order page and entering your order number and email address. Your order number was sent to your email after placing the order."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We currently accept bank transfers. After placing your order, you'll receive our bank details. Please transfer the amount and upload your payment receipt during checkout."
        },
        {
            question: "How long does delivery take?",
            answer: "Delivery typically takes 2-5 business days within Colombo and 3-7 business days for other areas in Sri Lanka. You'll receive tracking information once your order is shipped."
        },
        {
            question: "What is your return policy?",
            answer: "We offer a 7-day return policy for unopened products in original packaging. For defective items, we provide replacement or refund within 14 days of purchase. Please contact us for return authorization."
        },
        {
            question: "Do you offer warranty on products?",
            answer: "Yes, all products come with manufacturer warranty. Warranty periods vary by product - typically 1-3 years. Check individual product pages for specific warranty information."
        },
        {
            question: "Can I cancel my order?",
            answer: "You can cancel your order before payment confirmation. Once payment is confirmed and processing begins, cancellation may not be possible. Please contact us immediately if you need to cancel."
        },
        {
            question: "Do you ship outside Colombo?",
            answer: "Yes, we ship to all areas in Sri Lanka. Shipping costs and delivery times may vary based on location. Shipping cost is LKR 500 for most areas."
        },
        {
            question: "How do I know if a product is in stock?",
            answer: "Product availability is shown on each product page. If a product is out of stock, you can contact us to check when it will be available again."
        }
    ];

    const toggleFaq = (index) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-navy-950 py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Need Help?</h1>
                    <p className="text-gray-400 text-lg">We're here to assist you</p>
                </div>

                {/* Contact Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Contact Us */}
                    <div className="card p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Contact Us</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-lime-400/20 flex items-center justify-center">
                                    <Phone className="h-5 w-5 text-lime-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Phone</p>
                                    <a href="tel:+94766303131" className="text-white hover:text-lime-400 transition-colors">
                                        0766 303 131
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-lime-400/20 flex items-center justify-center">
                                    <Mail className="h-5 w-5 text-lime-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Email</p>
                                    <a href="mailto:geekspot.sales@gmail.com" className="text-white hover:text-lime-400 transition-colors">
                                        geekspot.sales@gmail.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-lime-400/20 flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-lime-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Address</p>
                                    <p className="text-white">
                                        No. 189/1, Janatha Mawatha,<br />
                                        Pannipitiya.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Business Hours */}
                    <div className="card p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Business Hours</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-lime-400/20 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-lime-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Monday - Friday</span>
                                            <span className="text-white">9:00 AM - 6:00 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Saturday</span>
                                            <span className="text-white">9:00 AM - 2:00 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Sunday</span>
                                            <span className="text-red-400">Closed</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-navy-800">
                                <p className="text-sm text-gray-400">
                                    💡 For urgent inquiries outside business hours, please send us an email and we'll respond as soon as possible.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQs */}
                <div className="card p-6 mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="border border-navy-800 rounded-lg overflow-hidden hover:border-navy-700 transition-colors"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex items-center justify-between p-4 text-left bg-navy-900 hover:bg-navy-800 transition-colors"
                                >
                                    <span className="text-white font-medium pr-4">{faq.question}</span>
                                    {expandedFaq === index ? (
                                        <ChevronDown className="h-5 w-5 text-lime-400 flex-shrink-0" />
                                    ) : (
                                        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                    )}
                                </button>
                                {expandedFaq === index && (
                                    <div className="p-4 bg-navy-950 border-t border-navy-800">
                                        <p className="text-gray-400">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Still Need Help */}
                <div className="bg-gradient-to-r from-lime-400/10 to-lime-400/5 border border-lime-400/30 rounded-lg p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-lime-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Still Need Help?</h3>
                    <p className="text-gray-400 mb-6">
                        Can't find the answer you're looking for? Our support team is ready to assist you.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="tel:+94766303131"
                            className="inline-flex items-center justify-center gap-2 bg-lime-400 hover:bg-lime-500 text-navy-950 font-semibold px-6 py-3 rounded-lg transition-colors"
                        >
                            <Phone className="h-5 w-5" />
                            Call Us Now
                        </a>
                        <a
                            href="mailto:geekspot.sales@gmail.com"
                            className="inline-flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                        >
                            <Mail className="h-5 w-5" />
                            Send Email
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
