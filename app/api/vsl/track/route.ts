import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { vslTracking } from '../../../../lib/vsl-schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      session_id,
      event_type,
      video_position,
      video_duration,
      completion_percentage,
      milestone,
      email,
    } = body;

    // Validate required fields
    if (!session_id || !event_type) {
      return NextResponse.json(
        { error: 'Missing required fields: session_id, event_type' },
        { status: 400 }
      );
    }

    // Get database connection
    const db = getDb();

    if (!db) {
      // Fallback: just log if DB not available
      console.log('VSL Tracking Event (no DB):', {
        session_id,
        event_type,
        video_position,
        email,
        completion_percentage,
        milestone,
      });
      return NextResponse.json({ success: true, persisted: false });
    }

    // Insert tracking event to database
    await db.insert(vslTracking).values({
      sessionId: session_id,
      eventType: event_type,
      videoPosition: video_position || 0,
      videoDuration: video_duration || 0,
      completionPercentage: completion_percentage || 0,
      milestone: milestone || null,
      email: email || null,
      userAgent: request.headers.get('user-agent') || null,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
    });

    return NextResponse.json({ success: true, persisted: true });
  } catch (error) {
    console.error('VSL tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track video event' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve tracking data for a session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const email = searchParams.get('email');

    if (!sessionId && !email) {
      return NextResponse.json(
        { error: 'Missing session_id or email parameter' },
        { status: 400 }
      );
    }

    // Get database connection
    const db = getDb();

    if (!db) {
      return NextResponse.json({
        data: [],
        message: 'Database not yet connected'
      });
    }

    // Query tracking data
    const { eq, desc } = await import('drizzle-orm');

    let trackingData;
    if (sessionId) {
      trackingData = await db
        .select()
        .from(vslTracking)
        .where(eq(vslTracking.sessionId, sessionId))
        .orderBy(desc(vslTracking.createdAt));
    } else if (email) {
      trackingData = await db
        .select()
        .from(vslTracking)
        .where(eq(vslTracking.email, email))
        .orderBy(desc(vslTracking.createdAt));
    }

    return NextResponse.json({ data: trackingData });
  } catch (error) {
    console.error('VSL tracking retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve tracking data' },
      { status: 500 }
    );
  }
}
