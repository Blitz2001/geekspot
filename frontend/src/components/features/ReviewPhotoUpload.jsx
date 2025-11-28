import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const ReviewPhotoUpload = ({ images, setImages, maxImages = 5 }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (images.length + files.length > maxImages) {
            toast.error(`You can only upload up to ${maxImages} images`);
            return;
        }

        setUploading(true);
        const newImages = [];

        try {
            for (const file of files) {
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`File ${file.name} is too large (max 5MB)`);
                    continue;
                }

                // Validate file type
                if (!file.type.startsWith('image/')) {
                    toast.error(`File ${file.name} is not an image`);
                    continue;
                }

                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

                const response = await axios.post(
                    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                    formData
                );

                newImages.push({
                    url: response.data.secure_url,
                    alt: file.name
                });
            }

            setImages([...images, ...newImages]);
            toast.success('Images uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload images');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                {images.map((img, index) => (
                    <div key={index} className="relative w-24 h-24 group">
                        <img
                            src={img.url}
                            alt={img.alt}
                            className="w-full h-full object-cover rounded-lg border border-navy-700"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {images.length < maxImages && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-navy-600 rounded-lg text-gray-400 hover:border-lime-400 hover:text-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            <Loader className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <Upload className="w-6 h-6 mb-1" />
                                <span className="text-xs">Upload</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*"
                className="hidden"
            />

            <p className="text-xs text-gray-500">
                Max {maxImages} images. Supported formats: JPG, PNG, WebP. Max size: 5MB.
            </p>
        </div>
    );
};
