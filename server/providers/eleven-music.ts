import type { MusicGenerationInput, MusicGenerationTask, MusicProvider } from "./contracts";

const ELEVEN_MUSIC_ENDPOINT = "https://api.elevenlabs.io/v1/music";

export class ElevenMusicProvider implements MusicProvider {
  readonly id = "elevenlabs";

  estimateCredits(input: MusicGenerationInput) {
    const durationBand = Math.ceil(input.durationSeconds / 30);
    return Math.max(4, durationBand * (input.mode === "vocal" ? 4 : 3));
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
      body: JSON.stringify({
        prompt: input.prompt,
        music_length_ms: input.durationSeconds * 1000,
        force_instrumental: input.mode === "instrumental",
        output_format: "mp3_44100_128",
      }),
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
    };
  }

  async getGenerationStatus(providerJobId: string): Promise<MusicGenerationTask> {
    return { providerJobId, status: "processing" };
  }

  async cancelGeneration() {
    return;
  }
}
