import { estimateMusicCredits, type MusicGenerationInput, type MusicGenerationTask, type MusicProvider } from "./contracts";

const ELEVEN_MUSIC_ENDPOINT = "https://api.elevenlabs.io/v1/music";

export function buildElevenMusicPayload(input: MusicGenerationInput) {
  return {
    prompt: [
      input.prompt,
      input.mode === "vocal" ? `Chanson avec voix, langue vocale : ${input.vocalLanguage === "auto" ? input.language : input.vocalLanguage}.` : "Instrumental sans voix.",
      input.mode === "vocal" && input.lyricsMode === "custom" && input.lyrics ? `Paroles à respecter :\n${input.lyrics}` : "",
      input.mode === "vocal" && input.lyricsMode === "generate" ? "Écrivez des paroles originales, structurées pour une chanson complète ; n’imitez aucun artiste ni texte existant." : "",
    ].filter(Boolean).join("\n\n"),
    music_length_ms: input.durationSeconds * 1000,
    model_id: "music_v2",
    force_instrumental: input.mode === "instrumental",
    output_format: "mp3_44100_128",
  };
}

export class ElevenMusicProvider implements MusicProvider {
  readonly id = "elevenlabs";

  estimateCredits(input: MusicGenerationInput) {
    return estimateMusicCredits(input);
  }

  async createGeneration(input: MusicGenerationInput): Promise<MusicGenerationTask> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return { providerJobId: `development-${input.requestId}`, status: "processing" };
    }

    const response = await fetch(ELEVEN_MUSIC_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify(buildElevenMusicPayload(input)),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Eleven Music a refusé la génération (${response.status}) : ${detail.slice(0, 400)}`);
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    const encodedAudio = Buffer.from(bytes).toString("base64");
    return {
      providerJobId: `eleven-${input.requestId}`,
      status: "completed",
      outputUrl: `data:audio/mpeg;base64,${encodedAudio}`,
      audioOutputs: [{ outputUrl: `data:audio/mpeg;base64,${encodedAudio}`, variant: "master", format: "mp3" }],
    };
  }

  async getGenerationStatus(providerJobId: string): Promise<MusicGenerationTask> {
    return { providerJobId, status: "processing" };
  }

  async cancelGeneration() {
    return;
  }
}
