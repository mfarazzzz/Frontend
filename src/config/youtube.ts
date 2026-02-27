export type YouTubeChannel = {
  id: string; // Channel ID starting with UC...
  title: string;
};

// Configure your YouTube channels here (no API key needed for embeds)
export const YOUTUBE_CHANNELS: YouTubeChannel[] = [
  // Example:
  // { id: "UCxxxxxxxxxxxxxxxx", title: "Rampur News" },
];

export const uploadsPlaylistId = (channelId: string) => {
  // Uploads playlist is 'UU' + channelId.substring(2)
  if (!channelId.startsWith("UC") || channelId.length < 3) return null;
  return `UU${channelId.substring(2)}`;
};

