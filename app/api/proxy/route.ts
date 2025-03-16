import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the URL to proxy from the query parameters
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }
    
    // Make the request to the external API
    const response = await fetch(url);
    
    // Check if the request was successful
    if (!response.ok) {
      return NextResponse.json(
        { error: `External API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get the response data
    const data = await response.json();
    
    // Return the response from the external API
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error proxying request:', error);
    return NextResponse.json(
      { error: `Proxy error: ${error.message}` },
      { status: 500 }
    );
  }
} 