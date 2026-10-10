import { getSession } from '@/lib/auth/session';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET() {
	try {
		const session = await getSession();

		if (!session) {
			return NextResponse.json({ session: null }, { status: 401 });
		}

		// Don't expose sensitive information to the client
		const safeSession = {
			id: session.id,
			email: session.email,
			name: session.name,
			role: session.role,
			expiresAt: session.expiresAt,
		};

		return NextResponse.json({ session: safeSession });
	} catch (error) {
		console.error('Session fetch error:', error);
		return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { token, user } = body;

		if (!token || !user) {
			return NextResponse.json(
				{ success: false, message: 'Token and user data are required' },
				{ status: 400 }
			);
		}

		// Create the response
		const response = NextResponse.json({
			success: true,
			message: 'Auth cookie set successfully',
		});

		// Set the auth_token cookie
		const expires = new Date();
		expires.setDate(expires.getDate() + 7); // 7 days

		response.cookies.set({
			name: 'auth_token',
			value: token,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			expires,
			path: '/',
		});

		return response;
	} catch (error) {
		console.error('Session set error:', error);
		return NextResponse.json({ error: 'Failed to set session' }, { status: 500 });
	}
}

export async function DELETE() {
	try {
		// Create the response
		const response = NextResponse.json({
			success: true,
			message: 'Logged out successfully',
		});

		// Clear the auth_token cookie
		response.cookies.set({
			name: 'auth_token',
			value: '',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			expires: new Date(0),
			path: '/',
		});

		return response;
	} catch (error) {
		console.error('Session delete error:', error);
		return NextResponse.json({ error: 'Failed to clear session' }, { status: 500 });
	}
}
