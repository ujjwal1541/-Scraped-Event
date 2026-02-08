import { useState } from 'react';
import { X, Mail, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Event } from '../types/database';

interface EmailCaptureModalProps {
  event: Event;
  onClose: () => void;
}

export function EmailCaptureModal({ event, onClose }: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !consent) {
      setError('Please provide your email and consent to continue');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase.from('email_captures').insert({
        email,
        consent_given: consent,
        event_id: event.id,
      });

      if (insertError) throw insertError;

      window.open(event.original_url, '_blank');
      onClose();
    } catch (err) {
      console.error('Error capturing email:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost there!</h2>
          <p className="text-gray-600">
            Enter your email to continue to <span className="font-medium">{event.title}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              required
            />
            <label htmlFor="consent" className="ml-3 text-sm text-gray-600">
              I agree to receive updates about events and special offers. You can unsubscribe at any time.
            </label>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !consent}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                Continue to Event
                <ExternalLink className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Your information is secure and will never be shared with third parties.
        </p>
      </div>
    </div>
  );
}
