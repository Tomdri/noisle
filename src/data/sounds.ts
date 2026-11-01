export type Category = "home" | "phone" | "emergency" | "body" | "nature" | "vehicle" | "people" | "signal" | "object";

export const CATEGORY_LABEL: Record<Category, string> = {
  home: "🏠 Around the house",
  phone: "☎️ Telephone",
  emergency: "🚨 Emergency",
  body: "🫀 Human body",
  nature: "🌿 Nature",
  vehicle: "🚗 Vehicles",
  people: "👥 People",
  signal: "📡 Signals & codes",
  object: "🧰 Everyday object",
};

export interface Sound {
  id: string;
  /** Shown on reveal. Keep it short: its letter shape is used as a hint. */
  answer: string;
  category: Category;
  /**
   * A guess is correct if it contains every word of any of these phrases
   * (word order, extra words, plurals, -ing/-ed forms and small typos are fine).
   */
  accept: string[];
  /** Same rules; a hit makes the guess "close" (yellow). */
  close: string[];
  file: string;
}

const gen = (id: string) => `/sounds/gen/${id}.wav`;

export const SOUNDS: Sound[] = [
  {
    id: "doorbell",
    answer: "Doorbell",
    category: "home",
    accept: ["doorbell", "door bell", "door chime", "ding dong"],
    close: ["bell", "chime", "door", "knock", "church", "ding", "xylophone", "glockenspiel"],
    file: gen("doorbell"),
  },
  {
    id: "phone-ring",
    answer: "Phone ringing",
    category: "phone",
    accept: ["phone", "telephone", "landline", "ringtone", "cellphone", "mobile ringing"],
    close: ["ring", "call", "dial tone", "busy", "bell", "alarm clock", "mobile", "cell"],
    file: gen("phone-ring"),
  },
  {
    id: "busy-signal",
    answer: "Busy signal",
    category: "phone",
    accept: ["busy", "engaged", "line occupied", "occupied tone"],
    close: ["phone", "telephone", "landline", "dial tone", "call", "hang up", "disconnected", "beep", "tone", "signal"],
    file: gen("busy-signal"),
  },
  {
    id: "police-siren",
    answer: "Police siren",
    category: "emergency",
    accept: ["siren", "police", "ambulance", "fire truck", "fire engine", "emergency vehicle", "cop car", "nee naw"],
    close: ["alarm", "air raid", "tornado", "alert", "emergency", "cop", "car alarm", "whistle"],
    file: gen("police-siren"),
  },
  {
    id: "heartbeat",
    answer: "Heartbeat",
    category: "body",
    accept: ["heart", "heartbeat", "pulse", "cardiac"],
    close: ["drum", "bass", "kick", "thump", "footstep", "knock", "stomp", "beat", "breathing", "chest"],
    file: gen("heartbeat"),
  },
  {
    id: "clock-ticking",
    answer: "Clock ticking",
    category: "home",
    accept: ["clock", "tick", "tick tock", "stopwatch", "wristwatch", "watch"],
    close: ["metronome", "time", "bomb", "click", "timer", "tapping", "typing", "countdown", "pendulum"],
    file: gen("clock-ticking"),
  },
  {
    id: "smoke-alarm",
    answer: "Smoke alarm",
    category: "emergency",
    accept: ["smoke", "fire alarm", "carbon monoxide"],
    close: ["alarm", "detector", "beep", "alert", "siren", "fire", "alarm clock", "evacuation"],
    file: gen("smoke-alarm"),
  },
  {
    id: "microwave",
    answer: "Microwave",
    category: "home",
    accept: ["microwave"],
    close: ["oven", "fridge", "refrigerator", "beep", "timer", "appliance", "hum", "fan", "washing machine", "dishwasher", "kitchen", "air conditioner", "toaster"],
    file: gen("microwave"),
  },
  {
    id: "ocean-waves",
    answer: "Ocean waves",
    category: "nature",
    accept: ["wave", "ocean", "sea", "beach", "surf", "shore", "tide", "seaside"],
    close: ["water", "wind", "river", "waterfall", "stream", "rain", "storm", "lake", "static", "white noise", "breath", "breathing"],
    file: gen("ocean-waves"),
  },
  {
    id: "rain",
    answer: "Rain",
    category: "nature",
    accept: ["rain", "rainy", "rainfall", "rainstorm", "drizzle", "downpour"],
    close: ["storm", "water", "shower", "static", "white noise", "fire", "crackling", "hail", "sizzling", "frying", "bacon", "waterfall", "drip", "thunder"],
    file: gen("rain"),
  },
  {
    id: "morse-sos",
    answer: "Morse code",
    category: "signal",
    accept: ["morse", "sos", "telegraph", "telegram", "mayday"],
    close: ["beep", "radio", "signal", "code", "dial", "alarm", "message", "distress", "communication"],
    file: gen("morse-sos"),
  },
  {
    id: "reversing-truck",
    answer: "Truck reversing",
    category: "vehicle",
    accept: ["reversing", "reverse", "backing up", "back up", "backup beeper", "forklift", "truck beeping", "lorry beeping", "garbage truck", "dump truck", "bin lorry"],
    close: ["truck", "lorry", "beep", "alarm", "car", "bus", "vehicle", "construction", "crane", "engine", "digger", "tractor", "van"],
    file: gen("reversing-truck"),
  },
  {
    id: "kettle",
    answer: "Whistling kettle",
    category: "home",
    accept: ["kettle", "teapot", "tea pot"],
    close: ["whistle", "boil", "water", "steam", "tea", "coffee", "pressure cooker", "stove", "train", "flute", "pot", "screech"],
    file: gen("kettle"),
  },
  {
    id: "car-horn",
    answer: "Car horn",
    category: "vehicle",
    accept: ["horn", "honk", "hooter"],
    close: ["car", "traffic", "vehicle", "truck", "bus", "trumpet", "goose", "duck", "toot", "beep beep", "klaxon"],
    file: gen("car-horn"),
  },
  {
    id: "crickets",
    answer: "Crickets",
    category: "nature",
    accept: ["cricket", "grasshopper"],
    close: ["insect", "bug", "cicada", "bird", "chirp", "night", "frog", "tweet", "locust"],
    file: gen("crickets"),
  },
  {
    id: "applause",
    answer: "Applause",
    category: "people",
    accept: ["applause", "applaud", "clap", "ovation"],
    close: ["crowd", "cheer", "audience", "rain", "fire", "crackling", "popcorn", "static", "firework", "hands", "audience"],
    file: gen("applause"),
  },
  {
    id: "typing",
    answer: "Keyboard typing",
    category: "object",
    accept: ["typing", "keyboard", "typewriter", "keystroke"],
    close: ["computer", "click", "mouse", "laptop", "tapping", "writing", "office", "pc", "key", "texting"],
    file: gen("typing"),
  },
  {
    id: "helicopter",
    answer: "Helicopter",
    category: "vehicle",
    accept: ["helicopter", "heli", "chopper", "copter"],
    close: ["plane", "airplane", "aeroplane", "jet", "engine", "fan", "drone", "motor", "propeller", "lawn mower", "motorbike", "motorcycle", "windmill"],
    file: gen("helicopter"),
  },
  {
    id: "bouncing-ball",
    answer: "Bouncing ball",
    category: "object",
    accept: ["ball", "basketball", "ping pong", "table tennis", "bounce", "dribble"],
    close: ["drum", "knock", "footstep", "hammer", "jump", "door", "tennis", "football", "soccer", "golf", "marble", "drop", "volleyball"],
    file: gen("bouncing-ball"),
  },
  {
    id: "dripping-tap",
    answer: "Dripping tap",
    category: "home",
    accept: ["drip", "droplet", "leak", "leaky", "faucet", "water drop", "drop of water", "dripping"],
    close: ["water", "tap", "rain", "sink", "plop", "bubble", "pipe", "toilet", "shower", "pour", "splash", "pond", "cave", "drop"],
    file: gen("dripping-tap"),
  },
];

export const SOUND_BY_ID: Record<string, Sound> = Object.fromEntries(SOUNDS.map((s) => [s.id, s]));
