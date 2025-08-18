import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Logout handler
export async function POST(request: NextRequest) {
    try {
        const sessionHandle = request.cookies.get('session_handle')?.value

        if (sessionHandle) {
            // Session'ı veritabanından sil
            await prisma.session.deleteMany({
                where: { handle: sessionHandle }
            })
        }

        const response = NextResponse.json({
            success: true,
            message: 'Logged out successfully'
        })

        // Session cookie'sini sil
        response.cookies.delete('session_handle')

        // OAuth cookie'lerini de temizle
        response.cookies.delete('oauth_state')
        response.cookies.delete('oauth_code_verifier')

        return response

    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json({
            success: false,
            error: 'logout_failed'
        })
    }
}
