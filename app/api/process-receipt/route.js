import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in with Google.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Convert the file to a buffer
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use fetch to call Vision API directly with OAuth token
    const visionApiUrl = 'https://vision.googleapis.com/v1/images:annotate';

    // Convert buffer to base64
    const base64Image = buffer.toString('base64');

    const visionResponse = await fetch(visionApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
              },
            ],
          },
        ],
      }),
    });

    if (!visionResponse.ok) {
      const errorData = await visionResponse.json();
      throw new Error(`Vision API error: ${JSON.stringify(errorData)}`);
    }

    const visionData = await visionResponse.json();
    const detections = visionData.responses[0]?.textAnnotations;

    if (!detections || detections.length === 0) {
      return NextResponse.json(
        { error: 'No text detected in the image' },
        { status: 400 }
      );
    }

    // The first annotation contains all detected text
    const fullText = detections[0]?.description || '';

    return NextResponse.json({
      success: true,
      text: fullText,
      // Include all annotations for more detailed processing if needed
      annotations: detections.map(annotation => ({
        description: annotation.description,
        boundingPoly: annotation.boundingPoly,
      })),
    });

  } catch (error) {
    console.error('Error processing receipt:', error);
    return NextResponse.json(
      { error: 'Failed to process receipt', details: error.message },
      { status: 500 }
    );
  }
}
