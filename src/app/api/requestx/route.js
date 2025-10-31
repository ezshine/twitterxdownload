// Cloudflare Turnstile 验证函数
async function verifyTurnstileToken(token) {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    
    if (!token) {
        return { success: false, error: 'No token provided' };
    }

    try {
        const response = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    secret: secretKey,
                    response: token,
                }),
            }
        );

        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
}
export async function GET(request) {
    const { searchParams } = new URL(request.url);

    if(process.env.TURNSTILE_SECRET_KEY){
        // 1. 获取 Turnstile token
        const turnstileToken = request.headers.get('x-turnstile-token');
        
        // 2. 验证 Turnstile token
        const verification = await verifyTurnstileToken(turnstileToken);
        
        if (!verification.success) {
            return Response.json({
                success: false,
                error: 'Security verification failed. Please refresh and try again.',
                error_code: 1003
            });
        }
    }

    const response = await fetch(`https://twitterxdownload.com/api/requestx?${searchParams.toString()}`, {
        headers: {
            'x-api-key': `${process.env.API_KEY}`
        }
    });
    const data = await response.json();
    
    return Response.json({
        ...data
    });
}