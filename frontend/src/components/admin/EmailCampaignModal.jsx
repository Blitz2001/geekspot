import { X, Send, Mail, Users, Tag, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CAMPAIGN_TYPES = {
    deals: {
        label: '🎉 New Deals',
        subject: '🎉 Exclusive Deals Just for You!',
        message: `Hi {customerName},

We're excited to share some exclusive deals with you!

[Add your deal details here]

Don't miss out on these amazing offers!

Best regards,
The Geekspot Team`
    },
    stock: {
        label: '🆕 Stock Updates',
        subject: '🆕 New Arrivals at Geekspot!',
        message: `Hi {customerName},

Great news! We've just restocked some of your favorite items.

[Add product details here]

Check them out before they're gone!

Best regards,
The Geekspot Team`
    },
    announcement: {
        label: '📢 Announcements',
        subject: '📢 Important Update from Geekspot',
        message: `Hi {customerName},

We have an important update to share with you.

[Add your announcement here]

Thank you for being a valued customer!

Best regards,
The Geekspot Team`
    },
    custom: {
        label: '✉️ Custom Email',
        subject: '',
        message: ''
    }
};

export const EmailCampaignModal = ({ isOpen, onClose, recipient }) => {
    const [campaignType, setCampaignType] = useState('deals');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [showPreview, setShowPreview] = useState(true);

    useEffect(() => {
        if (isOpen && campaignType) {
            const template = CAMPAIGN_TYPES[campaignType];
            setSubject(template.subject);
            setMessage(template.message);
        }
    }, [campaignType, isOpen]);

    const handleCampaignTypeChange = (type) => {
        setCampaignType(type);
    };

    const getRecipientInfo = () => {
        if (recipient === 'all') {
            return {
                label: 'All Customers',
                icon: <Users size={20} />,
                description: 'This email will be sent to all customers'
            };
        } else if (recipient) {
            return {
                label: `${recipient.firstName} ${recipient.lastName}`,
                icon: <Mail size={20} />,
                description: recipient.email
            };
        }
        return {
            label: 'No recipient',
            icon: <Mail size={20} />,
            description: 'Please select a recipient'
        };
    };

    const recipientInfo = getRecipientInfo();

    const getPreviewMessage = () => {
        if (!recipient) return message;

        const customerName = recipient === 'all'
            ? 'Customer'
            : recipient.firstName || 'Customer';

        return message.replace(/{customerName}/g, customerName);
    };

    const handleSend = async () => {
        // Validation
        if (!subject.trim()) {
            toast.error('Please enter an email subject');
            return;
        }
        if (!message.trim()) {
            toast.error('Please enter an email message');
            return;
        }
        if (!recipient) {
            toast.error('No recipient selected');
            return;
        }

        // Confirmation
        const recipientText = recipient === 'all'
            ? 'all customers'
            : `${recipient.firstName} ${recipient.lastName}`;

        const confirmed = window.confirm(
            `Are you sure you want to send this email to ${recipientText}?`
        );

        if (!confirmed) return;

        try {
            setSending(true);

            // TODO: Replace with actual API call when email service is configured
            // const response = await axios.post(
            //     `${API_URL}/customers/email-campaign`,
            //     {
            //         campaignType,
            //         subject,
            //         message,
            //         recipients: recipient === 'all' ? 'all' : [recipient._id]
            //     },
            //     { headers: getAuthHeader() }
            // );

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            toast.success(
                `Email campaign sent successfully! (Email service not configured yet)`,
                { duration: 4000 }
            );

            onClose();
        } catch (error) {
            toast.error('Failed to send email campaign');
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#1a2332] rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden animate-slideUp border border-[#2d3748]">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Send Email Campaign</h2>
                        <div className="flex items-center gap-2 text-sm opacity-90">
                            {recipientInfo.icon}
                            <div>
                                <p className="font-semibold">{recipientInfo.label}</p>
                                <p className="text-xs opacity-75">{recipientInfo.description}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-col lg:flex-row h-[calc(90vh-200px)]">
                    {/* Left Panel - Email Editor */}
                    <div className="flex-1 p-6 overflow-y-auto bg-[#0f1419]">
                        {/* Campaign Type Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-300 mb-3">
                                Campaign Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(CAMPAIGN_TYPES).map(([key, type]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleCampaignTypeChange(key)}
                                        className={`p-3 rounded-lg border-2 transition-all ${campaignType === key
                                                ? 'border-purple-500 bg-purple-500/20 text-white'
                                                : 'border-[#2d3748] bg-[#1a2332] text-gray-400 hover:border-purple-500/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Tag size={16} />
                                            <span className="font-medium text-sm">{type.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Subject Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Email Subject
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Enter email subject..."
                                className="w-full px-4 py-3 bg-[#1a2332] border border-[#2d3748] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                maxLength={200}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {subject.length}/200 characters
                            </p>
                        </div>

                        {/* Message Textarea */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Email Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter your message..."
                                rows={12}
                                className="w-full px-4 py-3 bg-[#1a2332] border border-[#2d3748] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                                maxLength={5000}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {message.length}/5000 characters
                            </p>
                        </div>

                        {/* Template Variables Info */}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <p className="text-sm text-blue-400 font-semibold mb-2">
                                💡 Template Variables
                            </p>
                            <p className="text-xs text-gray-400">
                                Use <code className="bg-[#1a2332] px-2 py-1 rounded text-blue-300">{'{customerName}'}</code> to personalize emails with the customer's first name.
                            </p>
                        </div>
                    </div>

                    {/* Right Panel - Email Preview */}
                    <div className="flex-1 p-6 bg-[#1a2332] border-l border-[#2d3748] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Eye size={20} />
                                Email Preview
                            </h3>
                        </div>

                        {/* Email Preview Card */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            {/* Email Header */}
                            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                                <h1 className="text-2xl font-bold">GEEKSPOT</h1>
                                <p className="text-sm opacity-90">Your Gaming Tech Store</p>
                            </div>

                            {/* Email Body */}
                            <div className="p-6">
                                {/* Subject */}
                                <h2 className="text-xl font-bold text-gray-800 mb-4">
                                    {subject || 'Email Subject'}
                                </h2>

                                {/* Message */}
                                <div className="text-gray-700 whitespace-pre-wrap">
                                    {getPreviewMessage() || 'Your message will appear here...'}
                                </div>
                            </div>

                            {/* Email Footer */}
                            <div className="bg-gray-100 p-6 border-t border-gray-200">
                                <p className="text-xs text-gray-600 text-center mb-2">
                                    © 2025 Geekspot. All rights reserved.
                                </p>
                                <p className="text-xs text-gray-500 text-center">
                                    You're receiving this email because you're a valued customer.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t border-[#2d3748] p-4 bg-[#1a2332] flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-[#2d3748] text-gray-300 rounded-lg hover:bg-[#3d4758] transition-colors"
                        disabled={sending}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={sending || !subject.trim() || !message.trim()}
                        className="flex items-center gap-2 px-6 py-2 bg-lime-400 text-gray-900 rounded-lg hover:bg-lime-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                        {sending ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Send Campaign
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
