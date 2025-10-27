export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  const response = await fetch(`https://twitterxdownload.com/api/requestdb?${searchParams.toString()}`);
  const data = await response.json();
  
  return Response.json({
    ...data
  });
}