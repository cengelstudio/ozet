import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const oauthConfig = {
      clientId: 'pSsyy6i3D7rGyK8Hpt68Uw',
      clientSecret: 'u3huMcdhrkUR9zVcODYIPGGg2fFgGbbb7JIwOI-juw0',
      redirectUri: process.env.NODE_ENV === 'production' 
        ? 'https://ozet.today/api/oauth'
        : 'http://localhost:3000/api/oauth',
      authUrl: 'https://id.cengel.studio/api/v2/oauth/authorize',
      tokenUrl: 'https://id.cengel.studio/api/v2/oauth/token',
      userInfoUrl: 'https://id.cengel.studio/api/v2/oauth/userinfo',
      scope: 'openid profile email'
    }

    return NextResponse.json({
      success: true,
      config: {
        ...oauthConfig,
        clientSecret: '***hidden***'
      },
      environment: process.env.NODE_ENV,
      requestUrl: request.url
    })
  } catch (error) {
    console.error('OAuth test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
