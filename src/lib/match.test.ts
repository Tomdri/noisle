import { describe, expect, it } from "vitest";
import { SOUNDS, SOUND_BY_ID } from "../data/sounds";
import { editDistance, judge, stem } from "./match";

const j = (id: string, text: string) => judge(text, SOUND_BY_ID[id]);

describe("stem", () => {
  it.each([
    ["bouncing", "bounce"], ["bounces", "bounce"], ["dripping", "drip"], ["dripped", "drip"], ["clapping", "clap"],
    ["claps", "clap"], ["waves", "wave"], ["whistling", "whistle"], ["kettles", "kettle"], ["ringing", "ring"],
    ["honking", "honk"], ["typing", "type"], ["glasses", "glass"], ["lorries", "lorry"], ["balls", "ball"],
  ])("%s ~ %s", (a, b) => expect(stem(a)).toBe(stem(b)));
});

describe("editDistance", () => {
  it("counts swaps as one edit", () => expect(editDistance("kettel", "kettle")).toBe(1));
  it("caps early", () => expect(editDistance("a", "abcdefgh", 2)).toBe(3));
});

describe("judge: every sound", () => {
  for (const s of SOUNDS) {
    it(`${s.id}: its answer and every accept phrase are correct`, () => {
      for (const p of [s.answer, ...s.accept]) expect(judge(p, s), p).toBe("correct");
      expect(judge(s.answer.toUpperCase() + "!!", s)).toBe("correct");
      expect(judge(`I think it's a ${s.answer.toLowerCase()} sound`, s)).toBe("correct");
    });

    it(`${s.id}: close phrases are not counted correct`, () => {
      for (const p of s.close) expect(judge(p, s), p).not.toBe("wrong");
    });

    it(`${s.id}: its accept phrases are never correct for another sound`, () => {
      for (const other of SOUNDS) {
        if (other.id === s.id) continue;
        for (const p of [s.answer, ...s.accept]) {
          expect(judge(p, other), `"${p}" judged against ${other.id}`).not.toBe("correct");
        }
      }
    });
  }
});

describe("judge: natural answers", () => {
  it.each([
    ["bouncing-ball", "ball bouncing"], ["bouncing-ball", "basketball dribbling"], ["bouncing-ball", "a ball"],
    ["bouncing-ball", "bouncign ball"], ["doorbell", "door bell"], ["doorbell", "the bell at the door"],
    ["doorbell", "Doorbell ringing"], ["phone-ring", "old telephone ringing"], ["phone-ring", "phone call"],
    ["busy-signal", "phone line busy"], ["busy-signal", "engaged tone"], ["police-siren", "ambulance"],
    ["police-siren", "police car"], ["police-siren", "siren"], ["police-siren", "sirens"], ["heartbeat", "heart beating"],
    ["heartbeat", "heart beat"], ["clock-ticking", "tick tock"], ["clock-ticking", "ticking clock"],
    ["smoke-alarm", "smoke detector"], ["smoke-alarm", "fire alarm beeping"], ["microwave", "microwave oven"],
    ["microwave", "micowave"], ["ocean-waves", "waves crashing"], ["ocean-waves", "the sea"], ["rain", "raining"],
    ["rain", "heavy rainfall"], ["morse-sos", "SOS"], ["morse-sos", "morse code"], ["reversing-truck", "truck backing up"],
    ["reversing-truck", "reversing lorry"], ["reversing-truck", "truck beeping"], ["reversing-truck", "big truck backing up"], ["kettle", "tea kettle"], ["kettle", "kettel"], ["car-horn", "car honking"],
    ["car-horn", "horn"], ["crickets", "crickets chirping"], ["applause", "people clapping"], ["applause", "aplause"],
    ["typing", "someone typing on a keyboard"], ["typing", "keybaord"], ["helicopter", "helicoptor"],
    ["helicopter", "chopper"], ["dripping-tap", "dripping faucet"], ["dripping-tap", "water dripping"],
    ["dripping-tap", "leaky tap"], ["dripping-tap", "drop of water"],
  ])("%s ← %s", (id, text) => expect(j(id, text)).toBe("correct"));
});

describe("judge: close but not right", () => {
  it.each([
    ["doorbell", "bell"], ["doorbell", "church bells"], ["phone-ring", "alarm clock"], ["busy-signal", "phone"],
    ["police-siren", "car alarm"], ["heartbeat", "drum"], ["clock-ticking", "metronome"], ["smoke-alarm", "alarm"],
    ["microwave", "fridge humming"], ["ocean-waves", "waterfall"], ["rain", "frying bacon"], ["morse-sos", "radio beeps"],
    ["reversing-truck", "car"], ["reversing-truck", "fire truck"], ["kettle", "whistle"], ["car-horn", "car"], ["crickets", "birds"], ["applause", "crowd cheering"],
    ["typing", "mouse clicking"], ["helicopter", "plane"], ["bouncing-ball", "football"], ["dripping-tap", "tap"],
  ])("%s ← %s", (id, text) => expect(j(id, text)).toBe("close"));
});

describe("judge: wrong", () => {
  it.each([
    ["bouncing-ball", "cat"], ["clock-ticking", "cow"], ["doorbell", "ping pong"], ["rain", "train"], ["car-horn", "corn"], ["doorbell", ""],
    ["doorbell", "   "], ["heartbeat", "the"], ["typing", "a type of bell"], ["kettle", "potato"], ["microwave", "dog barking"],
  ])("%s ← %s", (id, text) => expect(j(id, text)).toBe("wrong"));
});
