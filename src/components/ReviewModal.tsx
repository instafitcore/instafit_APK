// File: src/components/ReviewModal.tsx
"use client";

import { X, Star, User } from "lucide-react";

// You need to adjust this import path if ReviewModal.tsx is NOT in the same directory 
// as ServiceDetailsPage.tsx and its types. Assuming ServiceDetailsPage.tsx is 
// where the ServiceReview type is defined/exported:
// If ServiceDetailsPage.tsx is at src/app/site/services/[id]/page.tsx
// and this modal is at src/components/ReviewModal.tsx, this relative path is likely correct:
import { ServiceReview } from "@/app/site/services/[id]/page"; 


// Component to render star ratings within the modal
const StarRatingDisplay: React.FC<{ rating: number; size?: number }> = ({ rating, size = 5 }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center space-x-0.5">
            {[...Array(fullStars)].map((_, i) => (
                <Star key={`full-${i}`} className={`w-${size} h-${size} fill-yellow-400 text-yellow-400`} />
            ))}
            {hasHalfStar && (
                <div className="relative">
                    <Star className={`w-${size} h-${size} fill-yellow-400 text-yellow-400`} />
                    <div className="absolute top-0 right-0 overflow-hidden w-1/2">
                        <Star className={`w-${size} h-${size} text-gray-300 fill-gray-300`} />
                    </div>
                </div>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <Star key={`empty-${i}`} className={`w-${size} h-${size} text-gray-300`} />
            ))}
        </div>
    );
};

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    subcategory: string;
    reviews: ServiceReview[];
    averageRating: number | null;
}

export default function ReviewModal({ isOpen, onClose, subcategory, reviews, averageRating }: ReviewModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white p-6 border-b z-10">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-between">
                        Reviews for {subcategory}
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </h2>
                    
                    <div className="mt-4 flex items-center space-x-3">
                        {averageRating !== null && averageRating > 0 ? (
                            <>
                                <span className="text-3xl font-extrabold text-gray-900">{averageRating.toFixed(1)}</span>
                                <StarRatingDisplay rating={averageRating} size={8} />
                                <span className="text-gray-600">({reviews.length} total ratings)</span>
                            </>
                        ) : (
                            <span className="text-gray-500">No reviews found.</span>
                        )}
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {reviews.map((review, index) => ( // Using index as key is acceptable here since the list is static within the modal
                        <div key={review.id || index} className="border-b pb-6 last:border-b-0 last:pb-0">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-3">
                                    <User className="w-5 h-5 text-gray-500" />
                                    <span className="font-semibold text-gray-900">{review.employee_name || 'Anonymous User'}</span>
                                </div>
                                <StarRatingDisplay rating={review.rating} size={5} />
                            </div>
                            
                            <p className="text-gray-700 mt-2">{review.service_details}</p>
                            
                            <p className="text-xs text-gray-400 mt-3">
                                Reviewed on: {new Date(review.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}