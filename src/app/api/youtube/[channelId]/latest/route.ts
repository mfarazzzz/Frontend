import { NextResponse } from "next/server";

const parseFeed = (xml: string, limit = 6) => {
  const entries: Array<{ id: string; title: string; published: string; thumbnail?: string }> = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;
  while ((match = entryRegex.exec(xml)) !== null && entries.length < limit) {
    const entry = match[1];
    const idMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
    const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
    const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
    // media:thumbnail url
    const thumbMatch = entry.match(/<media:thumbnail[^>]*url="(.*?)"/);
    const id = idMatch?.[1]?.trim();
    const title = titleMatch?.[1]?.trim();
    const published = publishedMatch?.[1]?.trim();
    if (id && title) {
      entries.push({
        id,
        title,
        published: published || "",
        thumbnail: thumbMatch?.[1],
      });
    }
  }
  return entries;
};

export async function GET(request: Request, context: { params: { channelId: string } }) {
  try {
    const { channelId } = context.params;
    const url = new URL(request.url);
    const limit = Math.max(1, Math.min(10, Number(url.searchParams.get("limit") || "6")));
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
    const res = await fetch(feedUrl, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }
    const xml = await res.text();
    const items = parseFeed(xml, limit);
    return NextResponse.json({ items }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}

