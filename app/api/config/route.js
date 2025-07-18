 export async function GET() {
       return Response.json({
         supabaseUrl: process.env.VITE_SUPABASE_URL,
         supabaseKey: process.env.VITE_SUPABASE_ANON_KEY
       });
     }
