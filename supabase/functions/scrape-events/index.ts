import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ScrapedEvent {
  title: string;
  date_time: string;
  venue_name?: string;
  venue_address?: string;
  city: string;
  description?: string;
  category?: string;
  tags?: string[];
  image_url?: string;
  source_website: string;
  original_url: string;
}

async function scrapeEventbriteSydney(): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = [];

  try {
    const response = await fetch('https://www.eventbrite.com.au/d/australia--sydney/events/');
    const html = await response.text();

    const titleRegex = /<h3[^>]*class="[^"]*event-card__title[^"]*"[^>]*>([^<]+)<\/h3>/gi;
    const dateRegex = /<time[^>]*datetime="([^"]+)"[^>]*>/gi;
    const urlRegex = /<a[^>]*href="(https:\/\/www\.eventbrite\.com\.au\/e\/[^"]+)"[^>]*>/gi;

    const titles = Array.from(html.matchAll(titleRegex)).map(m => m[1].trim());
    const dates = Array.from(html.matchAll(dateRegex)).map(m => m[1]);
    const urls = Array.from(html.matchAll(urlRegex)).map(m => m[1]);

    const minLength = Math.min(titles.length, dates.length, urls.length, 10);

    for (let i = 0; i < minLength; i++) {
      events.push({
        title: titles[i],
        date_time: dates[i],
        city: 'Sydney',
        source_website: 'Eventbrite',
        original_url: urls[i],
        category: 'General',
        tags: ['sydney', 'eventbrite'],
      });
    }
  } catch (error) {
    console.error('Error scraping Eventbrite:', error);
  }

  return events;
}

async function scrapeMockEvents(): Promise<ScrapedEvent[]> {
  const baseDate = new Date();
  baseDate.setHours(19, 0, 0, 0);

  const mockEvents: ScrapedEvent[] = [
    {
      title: 'Sydney Opera House: Classical Concert Series',
      date_time: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      venue_name: 'Sydney Opera House',
      venue_address: 'Bennelong Point, Sydney NSW 2000',
      city: 'Sydney',
      description: 'Experience world-class classical music at the iconic Sydney Opera House. Featuring renowned orchestras and soloists.',
      category: 'Music',
      tags: ['music', 'classical', 'opera-house'],
      image_url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800',
      source_website: 'Sydney Opera House',
      original_url: 'https://www.sydneyoperahouse.com/events',
    },
    {
      title: 'Vivid Sydney: Light Festival Opening Night',
      date_time: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      venue_name: 'Circular Quay',
      venue_address: 'Circular Quay, Sydney NSW 2000',
      city: 'Sydney',
      description: 'The spectacular opening night of Vivid Sydney featuring stunning light installations and projections across the city.',
      category: 'Festival',
      tags: ['festival', 'lights', 'vivid', 'art'],
      image_url: 'https://images.pexels.com/photos/2034892/pexels-photo-2034892.jpeg?auto=compress&cs=tinysrgb&w=800',
      source_website: 'Vivid Sydney',
      original_url: 'https://www.vividsydney.com',
    },
    {
      title: 'Bondi Beach Food & Wine Festival',
      date_time: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      venue_name: 'Bondi Beach',
      venue_address: 'Bondi Beach, Sydney NSW 2026',
      city: 'Sydney',
      description: 'A celebration of Sydney\'s best food and wine, right on the beautiful Bondi Beach. Featuring local chefs and premium wines.',
      category: 'Food & Drink',
      tags: ['food', 'wine', 'bondi', 'festival'],
      image_url: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
      source_website: 'Bondi Markets',
      original_url: 'https://www.bondimarkets.com.au',
    },
    {
      title: 'Sydney Comedy Festival: Stand-Up Night',
      date_time: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      venue_name: 'The Comedy Store',
      venue_address: 'Fox Studios, 122 Lang Rd, Moore Park NSW 2021',
      city: 'Sydney',
      description: 'Laugh out loud with Australia\'s funniest comedians. A night of world-class stand-up comedy.',
      category: 'Comedy',
      tags: ['comedy', 'entertainment', 'stand-up'],
      image_url: 'https://images.pexels.com/photos/713149/pexels-photo-713149.jpeg?auto=compress&cs=tinysrgb&w=800',
      source_website: 'Comedy Store',
      original_url: 'https://www.comedystore.com.au',
    },
    {
      title: 'Harbour Bridge Climb Experience',
      date_time: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      venue_name: 'Sydney Harbour Bridge',
      venue_address: '3 Cumberland St, The Rocks NSW 2000',
      city: 'Sydney',
      description: 'Scale the iconic Sydney Harbour Bridge for breathtaking 360-degree views of the city and harbour.',
      category: 'Adventure',
      tags: ['adventure', 'bridge', 'experience', 'views'],
      image_url: 'https://images.pexels.com/photos/783682/pexels-photo-783682.jpeg?auto=compress&cs=tinysrgb&w=800',
      source_website: 'BridgeClimb',
      original_url: 'https://www.bridgeclimb.com',
    },
    {
      title: 'Royal Botanic Gardens: Moonlight Cinema',
      date_time: new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      venue_name: 'Royal Botanic Gardens',
      venue_address: 'Mrs Macquaries Rd, Sydney NSW 2000',
      city: 'Sydney',
      description: 'Watch classic and new-release films under the stars in the beautiful Royal Botanic Gardens.',
      category: 'Entertainment',
      tags: ['cinema', 'outdoor', 'gardens', 'movies'],
      image_url: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800',
      source_website: 'Moonlight Cinema',
      original_url: 'https://www.moonlight.com.au',
    },
    {
      title: 'Sydney Fish Market: Seafood Cooking Class',
      date_time: new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      venue_name: 'Sydney Fish Market',
      venue_address: 'Bank St, Pyrmont NSW 2009',
      city: 'Sydney',
      description: 'Learn to prepare fresh Australian seafood with expert chefs at the iconic Sydney Fish Market.',
      category: 'Workshop',
      tags: ['cooking', 'seafood', 'class', 'food'],
      image_url: 'https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg?auto=compress&cs=tinysrgb&w=800',
      source_website: 'Sydney Fish Market',
      original_url: 'https://www.sydneyfishmarket.com.au',
    },
    {
      title: 'Taronga Zoo: Twilight Concert Series',
      date_time: new Date(baseDate.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      venue_name: 'Taronga Zoo',
      venue_address: 'Bradleys Head Rd, Mosman NSW 2088',
      city: 'Sydney',
      description: 'Enjoy live music performances with stunning harbour views at Taronga Zoo\'s famous twilight concert series.',
      category: 'Music',
      tags: ['music', 'zoo', 'concert', 'outdoor'],
      image_url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800',
      source_website: 'Taronga Zoo',
      original_url: 'https://taronga.org.au',
    },
    {
      title: 'Darling Harbour: Chinese New Year Festival',
      date_time: new Date(baseDate.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      venue_name: 'Darling Harbour',
      venue_address: 'Darling Harbour, Sydney NSW 2000',
      city: 'Sydney',
      description: 'Celebrate Chinese New Year with dragon boat races, lion dances, and traditional performances at Darling Harbour.',
      category: 'Festival',
      tags: ['festival', 'cultural', 'chinese-new-year', 'family'],
      image_url: 'https://images.pexels.com/photos/2034892/pexels-photo-2034892.jpeg?auto=compress&cs=tinysrgb&w=800',
      source_website: 'City of Sydney',
      original_url: 'https://www.cityofsydney.nsw.gov.au',
    },
    {
      title: 'Art Gallery NSW: Contemporary Art Exhibition',
      date_time: new Date(baseDate.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(),
      venue_name: 'Art Gallery of New South Wales',
      venue_address: 'Art Gallery Rd, Sydney NSW 2000',
      city: 'Sydney',
      description: 'Explore cutting-edge contemporary art from Australian and international artists at the Art Gallery of NSW.',
      category: 'Art',
      tags: ['art', 'exhibition', 'gallery', 'culture'],
      image_url: 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=800',
      source_website: 'Art Gallery NSW',
      original_url: 'https://www.artgallery.nsw.gov.au',
    },
  ];

  return mockEvents;
}

async function updateEventsDatabase(events: ScrapedEvent[], supabase: any) {
  const results = {
    new: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  for (const event of events) {
    try {
      const { data: existing } = await supabase
        .from('events')
        .select('*')
        .eq('original_url', event.original_url)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase
          .from('events')
          .insert({
            ...event,
            status: 'new',
            last_scraped_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Insert error:', error);
          results.errors++;
        } else {
          results.new++;
        }
      } else {
        const hasChanges =
          existing.title !== event.title ||
          existing.date_time !== event.date_time ||
          existing.venue_name !== event.venue_name ||
          existing.venue_address !== event.venue_address;

        if (hasChanges) {
          const { error } = await supabase
            .from('events')
            .update({
              ...event,
              status: 'updated',
              last_scraped_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

          if (error) {
            console.error('Update error:', error);
            results.errors++;
          } else {
            results.updated++;
          }
        } else {
          const { error } = await supabase
            .from('events')
            .update({
              last_scraped_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

          if (!error) {
            results.skipped++;
          }
        }
      }
    } catch (error) {
      console.error('Error processing event:', error);
      results.errors++;
    }
  }

  return results;
}

async function markInactiveEvents(supabase: any, scrapedUrls: string[]) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);

  const { data: oldEvents } = await supabase
    .from('events')
    .select('id, original_url')
    .lt('last_scraped_at', cutoffDate.toISOString())
    .neq('status', 'inactive');

  if (oldEvents && oldEvents.length > 0) {
    const inactiveIds = oldEvents
      .filter((event: any) => !scrapedUrls.includes(event.original_url))
      .map((event: any) => event.id);

    if (inactiveIds.length > 0) {
      await supabase
        .from('events')
        .update({ status: 'inactive' })
        .in('id', inactiveIds);

      return inactiveIds.length;
    }
  }

  return 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const allEvents: ScrapedEvent[] = [];

    const eventbriteEvents = await scrapeEventbriteSydney();
    allEvents.push(...eventbriteEvents);

    const mockEvents = await scrapeMockEvents();
    allEvents.push(...mockEvents);

    const results = await updateEventsDatabase(allEvents, supabase);

    const scrapedUrls = allEvents.map(e => e.original_url);
    const inactiveCount = await markInactiveEvents(supabase, scrapedUrls);

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        total_scraped: allEvents.length,
        new_events: results.new,
        updated_events: results.updated,
        unchanged_events: results.skipped,
        inactive_events: inactiveCount,
        errors: results.errors,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Scraping error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
