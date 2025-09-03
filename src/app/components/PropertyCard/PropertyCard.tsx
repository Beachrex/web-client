import { Heart, Star, MapPin } from 'lucide-react';
import { Button } from '@/app/utils/ui/button';
import { Badge } from '@/app/utils/ui/badge';
import { ImageWithFallback } from '@/app/utils/figma/ImageWithFallback';

interface PropertyCardProps {
    id: string;
    image: string;
    title: string;
    location: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviews: number;
    discount?: string;
    isFreeBreakfast?: boolean;
    isFreeCancellation?: boolean;
}

export function PropertyCard({
                                 image,
                                 title,
                                 location,
                                 price,
                                 originalPrice,
                                 rating,
                                 reviews,
                                 discount,
                                 isFreeBreakfast,
                                 isFreeCancellation,
                             }: PropertyCardProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden">
            {/* Image */}
            <div className="relative aspect-[4/3]">
                <ImageWithFallback
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white"
                >
                    <Heart className="h-4 w-4" />
                </Button>
                {discount && (
                    <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                        -{discount}%
                    </Badge>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                        {title}
                    </h3>
                    <div className="flex items-center ml-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium ml-1">{rating}</span>
                    </div>
                </div>

                <div className="flex items-center text-gray-600 text-sm mb-3">
                    <MapPin className="h-3 w-3 mr-1" />
                    {location}
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {isFreeBreakfast && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Free breakfast
                        </Badge>
                    )}
                    {isFreeCancellation && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Free cancellation
                        </Badge>
                    )}
                </div>

                {/* Price */}
                <div className="flex items-end justify-between">
                    <div className="text-sm text-gray-600">
                        ({reviews} reviews)
                    </div>
                    <div className="text-right">
                        {originalPrice && (
                            <div className="text-sm text-gray-500 line-through">
                                €{originalPrice}
                            </div>
                        )}
                        <div className="text-lg font-bold text-gray-900">
                            €{price}
                        </div>
                        <div className="text-xs text-gray-600">per night</div>
                    </div>
                </div>
            </div>
        </div>
    );
}