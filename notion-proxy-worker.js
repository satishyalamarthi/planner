/**
 * Cloudflare Worker - Notion API CORS Proxy
 * Deploy this at workers.cloudflare.com (Free tier: 100k requests/day)
 * 
 * SETUP:
 * 1. Go to https://workers.cloudflare.com/
 * 2. Sign up (free)
 * 3. Create new Worker
 * 4. Replace the code with this script
 * 5. Deploy and copy the worker URL
 * 6. Use that URL as your CORS proxy in the planner
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Only allow POST requests
  if (request.method === 'OPTIONS') {
    return handleOptions(request)
  }
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }
  
  try {
    // Get the request body and headers from client
    const requestBody = await request.json()
    const { url, headers, body } = requestBody
    
    // Make request to Notion API
    const notionResponse = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    })
    
    const data = await notionResponse.json()
    
    // Return with CORS headers
    return new Response(JSON.stringify(data), {
      status: notionResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}

function handleOptions(request) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400'
    }
  })
}
