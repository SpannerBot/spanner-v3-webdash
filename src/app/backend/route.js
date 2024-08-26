export async function GET() {
  return Response.json(process.env.NEXT_PUBLIC_API_URL || "http://localhost:1237");
}