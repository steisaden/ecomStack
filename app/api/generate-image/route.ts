import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, width = 512, height = 512 } = await request.json();

    // Enhanced prompt engineering for unique, creative images
    const enhancedPrompt = `${prompt}. 
    Highly detailed, creative, artistic, professional quality.
    Rich colors, dynamic composition, professional lighting.
    Editorial-grade, photorealistic where applicable.`;

    // Add randomness to ensure uniqueness
    const randomSeed = Math.floor(Math.random() * 1000000);
    const uniquePrompt = `${enhancedPrompt} Style variation ${randomSeed}`;

    // Try OpenAI DALL-E first (prioritized for better quality)
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      // For dall-e-3, allowed sizes are 1024x1024, 1792x1024, 1024x1792
      const landscape = width >= height;
      let size: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024';
      if (landscape && (width >= 896 || height >= 640)) {
        size = '1792x1024';
      } else if (!landscape && (height >= 896 || width >= 640)) {
        size = '1024x1792';
      }

      console.log('Calling OpenAI DALL-E with prompt:', uniquePrompt.substring(0, 100) + '...');

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: uniquePrompt,
          n: 1,
          size,
          response_format: 'b64_json'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error response:', errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();

      const base64 = data?.data?.[0]?.b64_json;
      if (!base64) {
        throw new Error('No image data returned from OpenAI API');
      }

      const dataUrl = `data:image/png;base64,${base64}`;

      console.log('Successfully received image base64 from OpenAI, length:', base64.length);

      return NextResponse.json({
        success: true,
        imageUrl: dataUrl,
        prompt: uniquePrompt,
        width: size === '1792x1024' ? 1792 : size === '1024x1792' ? 1024 : 1024,
        height: size === '1792x1024' ? 1024 : size === '1024x1792' ? 1792 : 1024,
        source: 'dall-e-3',
        seed: randomSeed
      });
    } catch (openaiError: any) {
      console.log('OpenAI DALL-E 3 failed, trying DALL-E 2 as fallback:', openaiError.message);

      try {
        // Fallback to dall-e-2
        const response2 = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'dall-e-2',
            prompt: uniquePrompt,
            n: 1,
            size: '1024x1024',
            response_format: 'b64_json'
          }),
        });

        if (!response2.ok) {
          const errorText = await response2.text();
          console.error('OpenAI DALL-E 2 API error response:', errorText);
          throw new Error(`OpenAI DALL-E 2 API error: ${response2.status}`);
        }

        const data = await response2.json();
        const base64 = data?.data?.[0]?.b64_json;
        if (!base64) {
          throw new Error('No image data returned from OpenAI DALL-E 2 API');
        }

        const dataUrl = `data:image/png;base64,${base64}`;
        console.log('Successfully received image base64 from OpenAI DALL-E 2');

        return NextResponse.json({
          success: true,
          imageUrl: dataUrl,
          prompt: uniquePrompt,
          width: 1024,
          height: 1024,
          source: 'dall-e-2',
          seed: randomSeed
        });
      } catch (dalle2Error: any) {
        console.log('OpenAI DALL-E 2 also failed, trying HuggingFace as backup:', dalle2Error.message);

        // Try HuggingFace Stable Diffusion as backup
        if (!process.env.HUGGINGFACE_API_KEY) {
          throw new Error(`OpenAI image generation failed (${openaiError.message}) and HuggingFace API key is not configured.`);
        }

        try {
          console.log('Calling HuggingFace API with prompt:', uniquePrompt.substring(0, 100) + '...');

          const hfResponse = await fetch(
            "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
            {
              headers: {
                "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
              },
              method: "POST",
              body: JSON.stringify({
                inputs: uniquePrompt,
                parameters: {
                  width: Math.min(width, 1024),
                  height: Math.min(height, 1024),
                  num_inference_steps: 40,
                  guidance_scale: 7.5,
                  seed: randomSeed
                }
              }),
            }
          );

          console.log('HuggingFace API response status:', hfResponse.status);

          if (hfResponse.ok) {
            const imageBuffer = await hfResponse.arrayBuffer();
            const base64Image = Buffer.from(imageBuffer).toString('base64');
            const dataUrl = `data:image/png;base64,${base64Image}`;

            console.log('HuggingFace image converted to base64');

            return NextResponse.json({
              success: true,
              imageUrl: dataUrl,
              prompt: uniquePrompt,
              width: Math.min(width, 1024),
              height: Math.min(height, 1024),
              source: "stable-diffusion-xl",
              seed: randomSeed
            });
          } else {
            const errorDetails = await hfResponse.text();
            console.error('HuggingFace API error details:', errorDetails);
            throw new Error(`HuggingFace API error: ${hfResponse.status}`);
          }
        } catch (hfError: any) {
          console.error('HuggingFace backup also failed:', hfError.message);
          throw new Error(`All image generation services failed. OpenAI DALL-E 3: ${openaiError.message}, DALL-E 2: ${dalle2Error.message}, HuggingFace: ${hfError.message}`);
        }
      }
    }
  } catch (error: any) {
    console.error('Image generation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate image',
        details: error.toString ? error.toString() : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
