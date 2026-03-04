import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const score = searchParams.get('score');

    if (!domain) {
      // Return default OG image
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0f172a',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                S
              </div>
              <div
                style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  color: 'white',
                  letterSpacing: '-0.02em',
                }}
              >
                SiteJSON
              </div>
            </div>
            <div
              style={{
                fontSize: '36px',
                color: '#94a3b8',
                textAlign: 'center',
                maxWidth: '800px',
                lineHeight: 1.4,
              }}
            >
              Website Intelligence API
            </div>
            <div
              style={{
                fontSize: '24px',
                color: '#64748b',
                marginTop: '24px',
              }}
            >
              Traffic • SEO • Tech Stack • Trust Score
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Domain-specific OG image
    const scoreValue = score ? parseInt(score, 10) : null;
    const scoreColor = scoreValue
      ? scoreValue >= 70
        ? '#10b981'
        : scoreValue >= 40
          ? '#f59e0b'
          : '#ef4444'
      : '#64748b';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '40px 60px',
              backgroundColor: '#0f172a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                S
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>SiteJSON</div>
            </div>
            <div style={{ fontSize: '18px', color: '#94a3b8' }}>sitejson.com</div>
          </div>

          {/* Main Content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '60px',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '16px',
              }}
            >
              Website Intelligence Report
            </div>

            <div
              style={{
                fontSize: '64px',
                fontWeight: 'bold',
                color: '#0f172a',
                letterSpacing: '-0.02em',
                marginBottom: '32px',
                lineHeight: 1.1,
              }}
            >
              {domain}
            </div>

            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              {scoreValue && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: scoreColor,
                    }}
                  />
                  <div style={{ fontSize: '20px', color: '#475569' }}>
                    Trust Score: <span style={{ fontWeight: 'bold', color: scoreColor }}>{scoreValue}/100</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                  }}
                />
                <div style={{ fontSize: '20px', color: '#475569' }}>
                  Traffic Analysis
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#8b5cf6',
                  }}
                />
                <div style={{ fontSize: '20px', color: '#475569' }}>
                  Tech Stack Detection
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                  }}
                />
                <div style={{ fontSize: '20px', color: '#475569' }}>
                  SEO Metrics
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '30px 60px',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: '18px', color: '#64748b' }}>
              Analyze any domain at sitejson.com
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              View Full Report →
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
