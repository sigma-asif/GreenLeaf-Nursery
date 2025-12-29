
declare const Deno: any;

import "jsr:@supabase/functions-js/edge-runtime.d.ts";



const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderEmailRequest {
  customerEmail: string;
  customerName: string;
  plantName: string;
  quantity: number;
  totalAmount: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { customerEmail, customerName, plantName, quantity, totalAmount }: OrderEmailRequest = await req.json();

    console.log('Order received:', { customerEmail, customerName, plantName, quantity, totalAmount });

    const data = {
      success: true,
      message: 'Email notification logged successfully',
      orderDetails: {
        customerEmail,
        customerName,
        plantName,
        quantity,
        totalAmount,
      },
      note: 'Email functionality requires SMTP configuration. This is a placeholder response.',
    };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error processing order email:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});