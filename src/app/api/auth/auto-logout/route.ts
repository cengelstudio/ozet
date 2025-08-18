import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        // Session handle'ı cookie'den al
        const sessionHandle = request.cookies.get('session_handle')?.value

        // Veritabanından session'ı sil
        if (sessionHandle) {
            try {
                const { PrismaClient } = require('@prisma/client')
                const prisma = new PrismaClient()

                await prisma.session.delete({
                    where: { handle: sessionHandle }
                })

                await prisma.$disconnect()
                console.log('Auto logout: Session deleted from database:', sessionHandle)
            } catch (error) {
                console.error('Auto logout: Error deleting session from database:', error)
            }
        }

        // Response oluştur
        const response = NextResponse.json({
            success: true,
            message: 'Auto logout completed'
        })

        // Session cookie'lerini sil
        response.cookies.delete('session_handle')
        response.cookies.delete('oauth_state')

        return response

    } catch (error) {
        console.error('Auto logout API error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Auto logout failed'
            },
            { status: 500 }
        )
    }
}
