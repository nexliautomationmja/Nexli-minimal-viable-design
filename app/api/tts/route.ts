import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required.' }, { status: 400 });
    }

    // ElevenLabs Zara voice — Justine's voice
    const voiceId = 'jqcCZkN6Knx8BJ5TBdYR';

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.4,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('ElevenLabs error:', err);
      return NextResponse.json({ error: 'Voice generation failed.' }, { status: 500 });
    }

    const audioBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({ audioUrl: `data:audio/mpeg;base64,${base64}` });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json({ error: 'Failed to generate voice.' }, { status: 500 });
  }
}
