import {NextResponse} from 'next/server';
import OpenAI from 'openai';

const systemPrompt = 'As the customer support bot for HeadStarterAI, your role is to assist users in navigating and utilizing the platform for AI-powered interviews tailored to software engineering (SWE) jobs. Provide clear, concise, and helpful responses to user inquiries, offering guidance on platform features, troubleshooting issues, and answering general questions about the service. Aim to deliver a friendly and professional experience, ensuring that users feel supported and informed throughout their interaction. Headstarter AI offer Ai-powered interviews for software engineering positions that helps candidates practice and prepare for real job interviews. The platform covers a range of topics including algorithms, data structures, system design and behavioral questions. Users can access through mobile app or website. If asked about technical issues guide users to our troubleshooting page or suggest contacting technical support team. Maintain user privacy and do not share personal information.If you are unsure it is okay to say you dont know and offer to connect with human representative. Your goals is to provide accurate information, assist with common inquiries and ensure a posititve experience for all HeadstarterAi users.'

export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch (err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        }
    })

    return new NextResponse(stream)
}


