'use client';

export const useBeachDetailsFixture = () => {
  const data = {
    beach: {
      type: 'sand',
      naturalFeatures: ['brownSand', 'concrete'],
      occupancy: 'high',
      access: 'easy',
      paid: 'yes',
      lengthMeters: 750,
      widthMeters: 15,
      slope: 'low',
      swimmingAreaMeters: 5,
      seabed: ['sand', 'grass'],
    },
    userType: ['familyBeach'],

    infrastructure: [
      'toilet',
      'shower',
      'accommodation',
      'sunbeds',
      'playground',
      'sportsField',
      'lifeguard',
      'parking',
      'bench',
      'trashBin',
      'publicPhone',
      'wifi',
    ],

    accommodation: ['apartments', 'rooms', 'campground'],
    food: ['restaurant', 'fastFood', 'bakery', 'cafe'],
    sports: ['swimming', 'snorkeling', 'waterSports'],


    parking: {
      spots: '>100',
      wayToParking: 'asphalt', // BeachDetails.values.asphalt
      recommendedAccess: [
        'accessOnFoot',
        'accessBike',
        'accessCar',
        'accessOffroad',
        'accessMotorhome',
      ],
    },
    pathToBeach: {
      distanceMetersFromParking: '>50',
      elevationDiffMeters: 0,
    },
  };

  return { data };
};
