import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import {
  getUserEntitlements,
  isAccountEntitlementsConfigurationError,
} from '@/lib/entitlements';
import { isStarterCreditsConfigurationError } from '@/lib/starter-credits';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({
      ok: true,
      authenticated: false,
      plan: 'anonymous',
    });
  }

  try {
    const entitlements = await getUserEntitlements({
      sub: session.sub,
      login: session.login,
    });

    return NextResponse.json({
      ok: true,
      authenticated: true,
      plan: entitlements.plan,
      authProvider: entitlements.authProvider,
      entitlements: {
        starterCredits: entitlements.starterCredits.totalCredits,
        starterCreditsRemaining: entitlements.starterCredits.remainingCredits,
        starterCreditsUsed: entitlements.starterCredits.usedCredits,
        starterCreditsExhausted: entitlements.starterCredits.exhausted,
        monthlyQuota: entitlements.monthlyQuota.total,
        monthlyQuotaRemaining: entitlements.monthlyQuota.remaining,
        monthlyQuotaUsed: entitlements.monthlyQuota.used,
        monthlyQuotaActive: entitlements.monthlyQuota.active,
        monthlyQuotaResetAt: entitlements.monthlyQuota.resetAt,
        monthlyQuotaCycleStartAt: entitlements.monthlyQuota.cycleStartAt,
        monthlyQuotaCycleEndAt: entitlements.monthlyQuota.cycleEndAt,
        billingMode: entitlements.billingMode,
        paymentCheckoutAvailable: entitlements.paymentCheckoutAvailable,
        rateLimitPerMinute: entitlements.rateLimitPerMinute,
      },
      user: {
        id: session.sub,
        login: session.login,
        name: session.name ?? null,
        email: session.email ?? null,
        avatarUrl: session.avatarUrl ?? null,
      },
    });
  } catch (error) {
    if (isStarterCreditsConfigurationError(error) || isAccountEntitlementsConfigurationError(error)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'ENTITLEMENTS_STORE_UNAVAILABLE',
            message: error.message,
          },
        },
        {
          status: 503,
          headers: {
            'cache-control': 'no-store',
          },
        },
      );
    }

    throw error;
  }
}
