export type Category =
  | "Home"
  | "Phone"
  | "Alarm"
  | "Body"
  | "Nature"
  | "Vehicle"
  | "People"
  | "Signal"
  | "Object";

export interface Sound {
  id: string;
  answer: string;
  /** Other spellings/names that also count as correct. */
  aliases: string[];
  category: Category;
  file: string;
}

const gen = (id: string) => `/sounds/gen/${id}.wav`;

export const SOUNDS: Sound[] = [
  { id: "doorbell", answer: "Doorbell", aliases: ["door bell", "ding dong"], category: "Home", file: gen("doorbell") },
  { id: "phone-ring", answer: "Landline phone ringing", aliases: ["phone", "telephone", "phone ringing", "landline", "ringing phone", "telephone ringing"], category: "Phone", file: gen("phone-ring") },
  { id: "busy-signal", answer: "Busy signal", aliases: ["busy tone", "engaged tone", "phone busy"], category: "Phone", file: gen("busy-signal") },
  { id: "police-siren", answer: "Police siren", aliases: ["siren", "ambulance siren", "emergency siren"], category: "Alarm", file: gen("police-siren") },
  { id: "heartbeat", answer: "Heartbeat", aliases: ["heart beat", "heart", "heart beating"], category: "Body", file: gen("heartbeat") },
  { id: "clock-ticking", answer: "Clock ticking", aliases: ["clock", "ticking clock", "tick tock"], category: "Home", file: gen("clock-ticking") },
  { id: "smoke-alarm", answer: "Smoke alarm", aliases: ["smoke detector", "fire alarm"], category: "Alarm", file: gen("smoke-alarm") },
  { id: "microwave", answer: "Microwave", aliases: ["microwave oven", "microwave beeping"], category: "Home", file: gen("microwave") },
  { id: "ocean-waves", answer: "Ocean waves", aliases: ["waves", "sea", "ocean", "beach"], category: "Nature", file: gen("ocean-waves") },
  { id: "rain", answer: "Rain", aliases: ["rainfall", "raining", "rainstorm"], category: "Nature", file: gen("rain") },
  { id: "morse-sos", answer: "Morse code SOS", aliases: ["morse code", "sos", "morse"], category: "Signal", file: gen("morse-sos") },
  { id: "reversing-truck", answer: "Truck reversing", aliases: ["reversing truck", "backup beeper", "truck backing up", "reversing beeper"], category: "Vehicle", file: gen("reversing-truck") },
  { id: "kettle", answer: "Whistling kettle", aliases: ["kettle", "tea kettle", "kettle whistle"], category: "Home", file: gen("kettle") },
  { id: "car-horn", answer: "Car horn", aliases: ["horn", "honk", "car honking"], category: "Vehicle", file: gen("car-horn") },
  { id: "crickets", answer: "Crickets", aliases: ["cricket", "crickets chirping"], category: "Nature", file: gen("crickets") },
  { id: "applause", answer: "Applause", aliases: ["clapping", "crowd clapping", "claps"], category: "People", file: gen("applause") },
  { id: "typing", answer: "Keyboard typing", aliases: ["typing", "keyboard", "computer keyboard"], category: "Object", file: gen("typing") },
  { id: "helicopter", answer: "Helicopter", aliases: ["chopper", "heli"], category: "Vehicle", file: gen("helicopter") },
  { id: "bouncing-ball", answer: "Bouncing ball", aliases: ["ball bouncing", "basketball", "ball"], category: "Object", file: gen("bouncing-ball") },
  { id: "dripping-tap", answer: "Dripping tap", aliases: ["dripping faucet", "leaky tap", "water drip", "drip", "dripping water"], category: "Home", file: gen("dripping-tap") },
];

/** Wrong-but-plausible answers so the autocomplete doesn't give the game away. */
const DECOYS: [string, Category][] = [
  ["Alarm clock", "Alarm"], ["Car alarm", "Alarm"], ["Fire truck siren", "Alarm"], ["Air raid siren", "Alarm"], ["Tornado siren", "Alarm"],
  ["Dial tone", "Phone"], ["Text message alert", "Phone"], ["Phone vibrating", "Phone"], ["Fax machine", "Phone"], ["Dial-up modem", "Phone"],
  ["Washing machine", "Home"], ["Dishwasher", "Home"], ["Vacuum cleaner", "Home"], ["Toaster popping", "Home"], ["Blender", "Home"],
  ["Hair dryer", "Home"], ["Fridge humming", "Home"], ["Toilet flushing", "Home"], ["Shower running", "Home"], ["Frying pan sizzling", "Home"],
  ["Door creaking", "Home"], ["Door knock", "Home"], ["Cuckoo clock", "Home"], ["Ceiling fan", "Home"],
  ["Thunder", "Nature"], ["Wind", "Nature"], ["Waterfall", "Nature"], ["Campfire crackling", "Nature"], ["Birds chirping", "Nature"],
  ["Frogs croaking", "Nature"], ["Bees buzzing", "Nature"], ["Owl hooting", "Nature"], ["Wolf howling", "Nature"], ["River stream", "Nature"],
  ["Train", "Vehicle"], ["Motorcycle", "Vehicle"], ["Airplane", "Vehicle"], ["Bicycle bell", "Vehicle"], ["Car engine starting", "Vehicle"],
  ["Tires screeching", "Vehicle"], ["Boat horn", "Vehicle"], ["Lawn mower", "Vehicle"], ["Jackhammer", "Vehicle"],
  ["Crowd cheering", "People"], ["Laughing", "People"], ["Baby crying", "People"], ["Footsteps", "People"], ["Whistling", "People"], ["Snoring", "People"],
  ["Breathing", "Body"], ["Coughing", "Body"], ["Sneezing", "Body"], ["Stomach growling", "Body"], ["Knuckles cracking", "Body"],
  ["Radar ping", "Signal"], ["Sonar ping", "Signal"], ["Radio static", "Signal"], ["Metronome", "Signal"], ["Countdown beeps", "Signal"],
  ["Mouse clicking", "Object"], ["Ping pong", "Object"], ["Coins dropping", "Object"], ["Glass breaking", "Object"], ["Paper tearing", "Object"],
  ["Pen clicking", "Object"], ["Camera shutter", "Object"], ["Zipper", "Object"], ["Printer", "Object"], ["Scissors", "Object"],
];

export interface Option {
  label: string;
  category: Category;
}

export const OPTIONS: Option[] = [
  ...SOUNDS.map((s) => ({ label: s.answer, category: s.category })),
  ...DECOYS.map(([label, category]) => ({ label, category })),
].sort((a, b) => a.label.localeCompare(b.label));
