'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Button, Label, TextInput, Select, Textarea, Alert, Card } from 'flowbite-react';
import { GoogleLoginButton, UserProfile, LogoutButton } from '@/components/Auth';
import { MapPin, CreditCard } from 'lucide-react';

/**
 * AI Itinerary Generator Page
 *
 * Generates personalized multi-day beach itineraries.
 *
 * Requirements:
 * - Auth required for multi-day (2+) itineraries
 * - Credits required (enforced by backend with 402)
 * - Shows purchase button on 402 error
 * - Displays generated itinerary
 */

interface ItineraryResponse {
  itinerary: string;
  days: number;
  destination: string;
  credits_remaining: number;
}

interface EntitlementsResponse {
  credits: {
    itinerary_3day_credits: number;
    itinerary_7day_credits: number;
    itinerary_14day_credits: number;
  };
}

export default function AIItineraryPage() {
  const { isAuthenticated, user, token } = useAuth();
  const t = useTranslations('AI.itinerary');
  const tAuth = useTranslations('Auth');

  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('7');
  const [interests, setInterests] = useState('');
  const [budget, setBudget] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [showPaymentRequired, setShowPaymentRequired] = useState(false);

  const fetchCredits = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT ?? 'https://dev-api.beachrex.com'}/api/v1/me/entitlements`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = (await response.json()) as EntitlementsResponse;
        // Sum all credits for display
        const totalCredits =
          data.credits.itinerary_3day_credits +
          data.credits.itinerary_7day_credits +
          data.credits.itinerary_14day_credits;
        setCredits(totalCredits);
      }
    } catch (err) {
      console.error('[AIItineraryPage] Failed to fetch credits:', err);
    }
  }, [token]);

  // Fetch credits on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      void fetchCredits();
    }
  }, [isAuthenticated, token, fetchCredits]);

  const handleGenerate = async () => {
    if (!destination.trim() || !days) return;

    const numDays = parseInt(days, 10);

    // Check if auth required (2+ days)
    if (numDays >= 2 && !isAuthenticated) {
      setError(tAuth('loginRequiredMessage'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowPaymentRequired(false);
    setItinerary(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Parse destination (could be country code like "HR" or country name like "Croatia")
      const destinationTrimmed = destination.trim();
      const isCountryCode = destinationTrimmed.length === 2;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT ?? 'https://dev-api.beachrex.com'}/api/v1/ai/itineraries`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            destination: {
              country_code: isCountryCode ? destinationTrimmed.toUpperCase() : 'HR', // Default to HR if not a code
            },
            duration_days: numDays,
            preferences: {
              interests: interests.trim() ? [interests.trim()] : undefined,
            },
          }),
        }
      );

      if (response.status === 402) {
        // Payment required - show purchase button
        setShowPaymentRequired(true);
        setError(t('paymentRequired'));
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(errorData.message ?? `Failed to generate itinerary: ${response.status}`);
      }

      const data = await response.json() as ItineraryResponse;
      setItinerary(data);
      setCredits(data.credits_remaining);
    } catch (err) {
      console.error('[AIItineraryPage] Failed to generate itinerary:', err);
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      const numDays = parseInt(days, 10);

      // Map days to product type
      const productTypeMap: Record<3 | 7 | 14, string> = {
        3: 'itinerary_3day',
        7: 'itinerary_7day',
        14: 'itinerary_14day',
      };

      const productType = productTypeMap[numDays as 3 | 7 | 14];

      if (!productType) {
        throw new Error('Invalid duration selected');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT ?? 'https://dev-api.beachrex.com'}/api/v1/payments/stripe/checkout`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            product_type: productType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json() as { checkout_url: string };
      window.location.href = data.checkout_url;
    } catch (err) {
      console.error('[AIItineraryPage] Failed to create checkout:', err);
      setError('Failed to initiate purchase. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
              <p className="text-gray-600 mt-1">{t('subtitle')}</p>
            </div>
            <div>
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-4">
                  <UserProfile showEmail={false} />
                  <LogoutButton variant="link" />
                </div>
              ) : (
                <GoogleLoginButton />
              )}
            </div>
          </div>

          {isAuthenticated && credits !== null && (
            <Alert color="info">
              <span className="font-medium">{t('creditsRemaining', { count: credits })}</span>
            </Alert>
          )}
        </div>

        {/* Form */}
        <Card className="mb-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="destination">{t('form.destination')}</Label>
              <TextInput
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={t('form.destinationPlaceholder')}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="days">{t('form.days')}</Label>
              <TextInput
                id="days"
                type="number"
                min="1"
                max="30"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder={t('form.daysPlaceholder')}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="interests">{t('form.interests')}</Label>
              <Textarea
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder={t('form.interestsPlaceholder')}
                rows={2}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="budget">{t('form.budget')}</Label>
              <Select
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                disabled={isLoading}
              >
                <option value="low">{t('form.budgetLow')}</option>
                <option value="medium">{t('form.budgetMedium')}</option>
                <option value="high">{t('form.budgetHigh')}</option>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!destination.trim() || !days || isLoading}
              color="blue"
              className="w-full"
            >
              {isLoading ? (
                <>{t('form.generating')}</>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('form.generate')}
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert color="failure" className="mb-6" onDismiss={() => setError(null)}>
            <div className="flex items-center justify-between">
              <span>{error}</span>
              {showPaymentRequired && (
                <Button size="sm" color="success" onClick={handlePurchase}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t('purchaseCredits')}
                </Button>
              )}
            </div>
          </Alert>
        )}

        {/* Itinerary Result */}
        {itinerary && (
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {itinerary.days}-Day {itinerary.destination} Itinerary
            </h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                {itinerary.itinerary}
              </pre>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
