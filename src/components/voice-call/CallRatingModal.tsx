import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import Button from '../Button';
import { callsService } from '../../services/calls';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';

interface CallRatingModalProps {
    callId: string;
    partnerName: string;
    onClose: () => void;
}

const CallRatingModal: React.FC<CallRatingModalProps> = ({ callId, partnerName, onClose }) => {
    const dispatch = useDispatch();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            dispatch(showToast({ message: 'Please select a rating', type: 'error' }));
            return;
        }

        try {
            setIsSubmitting(true);
            await callsService.rate(callId, rating);

            dispatch(showToast({
                message: 'Thank you for your feedback!',
                type: 'success'
            }));

            onClose();
        } catch (error: any) {
            console.error('Failed to submit rating:', error);
            dispatch(showToast({
                message: error?.response?.data?.message || 'Failed to submit rating',
                type: 'error'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                            Rate Your Call
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            How was your conversation with {partnerName}?
                        </p>
                    </div>
                    <button
                        onClick={handleSkip}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Star Rating */}
                <div className="mb-8">
                    <div className="flex justify-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="p-2 transition-transform hover:scale-110 active:scale-95"
                                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                            >
                                <Star
                                    size={48}
                                    className={`transition-all ${star <= (hoveredRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'fill-none text-slate-300 dark:text-slate-600'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Rating Label */}
                    <div className="text-center">
                        {rating > 0 && (
                            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 animate-in fade-in slide-in-from-bottom-2">
                                {rating === 1 && '😞 Poor'}
                                {rating === 2 && '😕 Fair'}
                                {rating === 3 && '😊 Good'}
                                {rating === 4 && '😄 Very Good'}
                                {rating === 5 && '🌟 Excellent'}
                            </p>
                        )}
                        {rating === 0 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Tap a star to rate
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSkip}
                        className="flex-1 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors"
                    >
                        Skip
                    </button>
                    <Button
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        disabled={rating === 0 || isSubmitting}
                        className="flex-1"
                        variant="primary"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CallRatingModal;
