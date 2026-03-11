import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_URL = Deno.env.get("SITE_URL") || "https://notifications.21vest.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { application_id, email, first_name } = await req.json();

    if (!application_id || !email || !first_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const completionUrl = `${SITE_URL}/complete-application.html?id=${application_id}`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "RemoteEdge <onboarding@resend.dev>",
        to: [email],
        subject: `${first_name}, let's finish your application!`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="background:#fff;border-radius:12px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      <div style="margin-bottom:32px;">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="28" height="28" rx="8" fill="#1B4332"/>
          <path d="M9 22V10h5.5a4 4 0 0 1 0 8H9" stroke="#FAF7F2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M15 18l5 4" stroke="#FAF7F2" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </div>

      <h1 style="font-size:22px;color:#1B4332;margin:0 0 16px;">Hey ${first_name}, great start!</h1>

      <p style="font-size:15px;color:#5C5A52;line-height:1.7;margin:0 0 12px;">
        Thanks for signing up with RemoteEdge. We just need a few more details to match you with the right remote roles.
      </p>

      <p style="font-size:15px;color:#5C5A52;line-height:1.7;margin:0 0 28px;">
        It takes about 5 minutes — just some quick questions and your resume.
      </p>

      <a href="${completionUrl}" style="display:inline-block;background:#1B4332;color:#FAF7F2;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        Complete your application &rarr;
      </a>

      <p style="font-size:13px;color:#9C9A92;line-height:1.6;margin:32px 0 0;">
        If the button doesn't work, copy and paste this link:<br>
        <a href="${completionUrl}" style="color:#A84830;word-break:break-all;">${completionUrl}</a>
      </p>
    </div>

    <p style="font-size:12px;color:#9C9A92;text-align:center;margin:24px 0 0;">
      RemoteEdge &mdash; Your Edge to Remote Work
    </p>
  </div>
</body>
</html>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const data = await res.json();

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
