import { PropertyCard } from './PropertyCard/PropertyCard';

interface Property {
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

interface PropertySectionProps {
    title: string;
    properties: Property[];
}

export function PropertySection({ title, properties }: PropertySectionProps) {
    return (
        <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {properties.map((property) => (
                        <PropertyCard key={property.id} {...property} />
                    ))}
                </div>
            </div>
        </section>
    );
}