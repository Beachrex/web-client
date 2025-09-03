import { Badge } from '@/app/utils/ui/badge';
import { ImageWithFallback } from '@/app/utils/figma/ImageWithFallback';

const topFilterBadges = [
    { label: 'Regija', color: 'bg-purple-600 hover:bg-purple-700', icon: '🇭🇷' },
    { label: 'Kvarner', color: 'bg-pink-600 hover:bg-pink-700' },
    { label: '5k result, 123', color: 'bg-gray-300 hover:bg-gray-400 text-gray-800' },
    { label: 'Co.created:info', color: 'bg-gray-300 hover:bg-gray-400 text-gray-800' },
];

const bottomFilterBadges = [
    { label: 'Festival Crna ovca', color: 'bg-pink-500 hover:bg-pink-600' },
    { label: 'Vino Žlahtina', color: 'bg-green-500 hover:bg-green-600' },
    { label: 'Krka lignjećak', color: 'bg-orange-500 hover:bg-orange-600' },
    { label: 'Festival Crna ovca', color: 'bg-red-500 hover:bg-red-600' },
    { label: 'Vino Žlahtina', color: 'bg-blue-500 hover:bg-blue-600' },
    { label: 'Krka lignjećak', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { label: 'Krka lignjećak', color: 'bg-purple-500 hover:bg-purple-600' },
    { label: 'Festival Crna ovca', color: 'bg-pink-400 hover:bg-pink-500' },
    { label: 'Vino Žlahtina', color: 'bg-green-400 hover:bg-green-500' },
    { label: 'Festival Crna ovca', color: 'bg-orange-400 hover:bg-orange-500' },
    { label: 'Vino Žlahtina', color: 'bg-red-400 hover:bg-red-500' },
    { label: 'Vino Žlahtina', color: 'bg-blue-400 hover:bg-blue-500' },
];

const destinations = [
    {
        title: 'Zgodovina',
        subtitle: 'City is a Croatian island in the northern Adriatic Sea, located near Rijeka in the Bay of Kvarner and part of Primorje-Gorski Kotar County.',
        image: 'https://images.unsplash.com/photo-1600493505873-cddd69453072?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2FzdGFsJTIwYXBhcnRtZW50JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzU2OTEyNjI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
        title: 'Kulinarika',
        subtitle: 'City is a Croatian island in the northern Adriatic Sea, located near Rijeka in the Bay of Kvarner and part of Primorje-Gorski Kotar County.',
        image: 'https://images.unsplash.com/photo-1615858770618-27f91b9c066c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHJpYXRpYyUyMHNlYSUyMGhvdGVsfGVufDF8fHx8MTc1NjkxMjYyOXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
        title: 'Kultura',
        subtitle: 'City is a Croatian island in the northern Adriatic Sea, located near Rijeka in the Bay of Kvarner and part of Primorje-Gorski Kotar County.',
        image: 'https://images.unsplash.com/photo-1641150557653-e4c409426e59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHJlc29ydCUyMGFlcmlhbHxlbnwxfHx8fDE3NTY5MTI2Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
        title: 'Znamenitosti',
        subtitle: 'City is a Croatian island in the northern Adriatic Sea, located near Rijeka in the Bay of Kvarner and part of Primorje-Gorski Kotar County.',
        image: 'https://images.unsplash.com/photo-1694818740144-65ac2c8c8c62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9hdGlhJTIwdmFjYXRpb24lMjByZW50YWx8ZW58MXx8fHwxNzU2OTEyNjI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
];

export function HeroSection() {
    return (
        <div className="relative min-h-[500px] bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <ImageWithFallback
                    src="https://images.unsplash.com/photo-1567882028577-703362976dd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrdmFybmVyJTIwY3JvYXRpYSUyMGJlYWNoJTIwY29hc3RsaW5lfGVufDF8fHx8MTc1NjkxMjYyOXww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Kvarner coastline"
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top Filter Badges */}
                <div className="flex flex-wrap gap-2 pt-4 mb-8">
                    {topFilterBadges.map((badge, index) => (
                        <Badge
                            key={index}
                            className={`${badge.color} ${badge.color.includes('gray') ? 'text-gray-800' : 'text-white'} border-0 px-3 py-2 cursor-pointer transition-colors rounded-full`}
                        >
                            {badge.icon && <span className="mr-1">{badge.icon}</span>}
                            {badge.label}
                        </Badge>
                    ))}
                </div>

                {/* Main Content Layout */}
                <div className="flex justify-between items-start mb-16">
                    {/* Left Side - Title and Tags */}
                    <div className="flex-1">
                        <div className="max-w-lg">
                            <h1 className="text-7xl font-bold text-white mb-6 leading-tight">
                                Kvarner
                            </h1>

                            {/* Bottom Filter Tags */}
                            <div className="flex flex-wrap gap-2">
                                {bottomFilterBadges.map((badge, index) => (
                                    <Badge
                                        key={index}
                                        className={`${badge.color} text-white border-0 px-3 py-1 cursor-pointer transition-colors rounded-full text-sm`}
                                    >
                                        {badge.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Weather Widget */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 ml-8">
                        <div className="flex items-center space-x-4">
                            {/* Mini Map */}
                            <div className="w-16 h-16 bg-blue-200 rounded-lg overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-br from-blue-300 to-green-300 relative">
                                    <div className="absolute inset-2 bg-blue-400 rounded opacity-60"></div>
                                </div>
                            </div>

                            {/* Weather Info */}
                            <div className="text-white">
                                <div className="text-2xl font-bold">11</div>
                                <div className="text-sm opacity-90">4 hrs, Cres Krk</div>
                            </div>

                            {/* Weather Icon */}
                            <div className="text-3xl">🌤️</div>
                        </div>
                    </div>
                </div>

                {/* Destination Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
                    {destinations.map((destination, index) => (
                        <div key={index} className="bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden">
                            <div className="aspect-[4/3] relative">
                                <ImageWithFallback
                                    src={destination.image}
                                    alt={destination.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-red-600 mb-2">{destination.title}</h3>
                                <p className="text-sm text-gray-600 leading-tight">{destination.subtitle}</p>
                                <div className="mt-2">
                  <span className="text-xs text-blue-600 cursor-pointer hover:underline">
                    Discover →
                  </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Default export for compatibility
export default HeroSection;