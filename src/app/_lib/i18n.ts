export type Language = "en" | "nl";

export type Copy = {
  chooseLanguage: string;
  languageHint: string;
  nailAtelier: string;

  aiHandScan: string;
  splashHeadlineLead: string;
  splashHeadlineAccent: string;
  splashHeadlineTail: string;
  splashSubtitle: string;
  startHandScan: string;
  preparing: string;
  usePhotoInstead: string;

  noHandInPhoto: string;
  imageUnreadable: string;
  photoAnalyseFailed: string;

  handScan: string;
  back: string;
  switchCamera: string;
  showHand: string;
  showHandDetail: string;
  moveCloser: string;
  moveCloserDetail: string;
  wholeHand: string;
  wholeHandDetail: string;
  holdStill: string;
  holdStillDetail: string;
  measuring: string;
  measuringDetail: string;
  preparingScanner: string;
  loadingModel: string;
  recommending: string;
  tryAgain: string;
  uploadPhoto: string;
  scannerUnavailable: string;
  cameraUnsupported: string;
  cameraDenied: string;
  cameraNotFound: string;
  cameraStartFailed: string;
  modelLoadFailed: string;

  yourResult: string;
  saveImage: string;
  match: string;
  stylistPick: string;
  holdToCompare: string;
  bareHand: string;
  align: string;
  fineTuneAlignment: string;
  recommendedShape: string;
  previewing: string;
  shape: string;
  alsoSuitsYou: string;
  offPickNote: (shapeName: string) => string;
  shapeSummaries: Record<
    "round" | "oval" | "squoval" | "almond" | "coffin" | "stiletto",
    string
  >;
  saveThisLook: string;
  scanAgain: string;
  nextClient: string;

  shareTitle: string;
  shareSubtitle: string;
  shareScanHint: string;
  shareShape: string;
  shareColour: string;
  shareDownload: string;
  shareSend: string;
  shareCopyLink: string;
  shareLinkCopied: string;
  shareClose: string;
  shareQrAlt: string;

  colourDesign: string;
  shades: (count: number) => string;
  categorySolid: string;
  categoryChrome: string;
  categoryFrench: string;
  categoryTrending: string;
  skinBadge: (depth: string, undertone: string) => string;
  undertoneWarm: string;
  undertoneCool: string;
  undertoneNeutral: string;
  depthFair: string;
  depthLight: string;
  depthMedium: string;
  depthTan: string;
  depthDeep: string;
  adviceWarm: string;
  adviceCool: string;
  adviceNeutral: string;

  alignAlong: string;
  alignAcross: string;
  alignWidth: string;
  alignLength: string;
  resetAlignment: string;
};

const EN: Copy = {
  chooseLanguage: "Choose your language",
  languageHint: "Select to continue",
  nailAtelier: "Nail Atelier",

  aiHandScan: "AI Hand Scan",
  splashHeadlineLead: "Discover the shape",
  splashHeadlineAccent: "your hands",
  splashHeadlineTail: "were made for",
  splashSubtitle: "AI-powered hand analysis & instant shape matching.",
  startHandScan: "Start Hand Scan",
  preparing: "Preparing",
  usePhotoInstead: "Use a photo instead",

  noHandInPhoto:
    "No hand was found in that photo. Use a well-lit shot with the palm down and all five fingertips inside the frame.",
  imageUnreadable: "That image could not be read.",
  photoAnalyseFailed: "That photo could not be analysed.",

  handScan: "Hand Scan",
  back: "Back",
  switchCamera: "Switch camera",
  showHand: "Show your hand",
  showHandDetail: "Palm down, fingers relaxed and slightly apart",
  moveCloser: "Move a little closer",
  moveCloserDetail: "Fill the frame with your hand",
  wholeHand: "Bring the whole hand into frame",
  wholeHandDetail: "All five fingertips need to be visible",
  holdStill: "Hold still",
  holdStillDetail: "Almost there — steady now",
  measuring: "Measuring",
  measuringDetail: "Keep your hand exactly where it is",
  preparingScanner: "Preparing the scanner",
  loadingModel: "Loading the hand tracking model",
  recommending: "Recommending",
  tryAgain: "Try again",
  uploadPhoto: "Upload a photo",
  scannerUnavailable: "The scanner is unavailable.",
  cameraUnsupported:
    "This browser cannot open a camera. Upload a photo of your hand instead.",
  cameraDenied:
    "Camera access was declined. Allow it in your browser settings, or upload a photo instead.",
  cameraNotFound: "No usable camera was found on this device.",
  cameraStartFailed: "The camera could not be started.",
  modelLoadFailed: "The hand tracking model could not be loaded.",

  yourResult: "Your Result",
  saveImage: "Save image",
  match: "Match",
  stylistPick: "Stylist pick",
  holdToCompare: "Hold to compare",
  bareHand: "Bare hand",
  align: "Align",
  fineTuneAlignment: "Fine-tune alignment",
  recommendedShape: "Recommended shape",
  previewing: "Previewing",
  shape: "Shape",
  alsoSuitsYou: "Also suits you",
  offPickNote: (shapeName) =>
    `A stylish alternative — your scan leans toward ${shapeName}.`,
  shapeSummaries: {
    round:
      "Keeps the silhouette neat and natural with a soft, low-maintenance edge.",
    oval: "Softly elongates the fingers with a classic, endlessly wearable curve.",
    squoval:
      "Balances clean side walls with gently rounded corners for everyday polish.",
    almond:
      "Complements slender fingers with an elegant, elongated silhouette.",
    coffin: "Gives tapered walls and a flat tip a sculpted, editorial finish.",
    stiletto:
      "Carries the boldest line — a dramatic taper that reads sharp and intentional.",
  },
  saveThisLook: "Save this look",
  scanAgain: "Scan again",
  nextClient: "Next Client",

  shareTitle: "Your look",
  shareSubtitle: "Take it with you",
  shareScanHint: "Scan to open this shape and shade on your own phone.",
  shareShape: "Shape",
  shareColour: "Colour",
  shareDownload: "Download image",
  shareSend: "Send",
  shareCopyLink: "Copy link",
  shareLinkCopied: "Link copied",
  shareClose: "Close",
  shareQrAlt: "QR code linking to this look",

  colourDesign: "Colour & Design",
  shades: (count) => `${count} shades`,
  categorySolid: "Solid Colors",
  categoryChrome: "Chrome & Glazed",
  categoryFrench: "French & Minimal",
  categoryTrending: "Trending Designs",
  skinBadge: (depth, undertone) => `${depth} skin · ${undertone} undertone`,
  undertoneWarm: "warm",
  undertoneCool: "cool",
  undertoneNeutral: "neutral",
  depthFair: "Fair",
  depthLight: "Light",
  depthMedium: "Medium",
  depthTan: "Tan",
  depthDeep: "Deep",
  adviceWarm:
    "Golden and caramel bases sing against your skin. Reach for champagne chrome, café crème and terracotta before anything blue-based.",
  adviceCool:
    "Your skin has a pink cast, so rose, mauve and silver-based shades read cleanest. Icy chromes and bordeaux will look intentional rather than harsh.",
  adviceNeutral:
    "You sit between warm and cool, which is the rare skin that carries almost anything. Milky nudes and glazed pearls will always be your safest luxury.",

  alignAlong: "Position along finger",
  alignAcross: "Position across nail",
  alignWidth: "Width",
  alignLength: "Length",
  resetAlignment: "Reset alignment",
};

const NL: Copy = {
  chooseLanguage: "Kies je taal",
  languageHint: "Selecteer om verder te gaan",
  nailAtelier: "Nail Atelier",

  aiHandScan: "AI Handscan",
  splashHeadlineLead: "Ontdek de vorm",
  splashHeadlineAccent: "die jouw handen",
  splashHeadlineTail: "verdienden",
  splashSubtitle: "AI-gestuurde handanalyse & directe vormmatching.",
  startHandScan: "Start handscan",
  preparing: "Voorbereiden",
  usePhotoInstead: "Gebruik liever een foto",

  noHandInPhoto:
    "Geen hand gevonden op die foto. Gebruik een goed belichte opname met de palm naar beneden en alle vijf vingertoppen in beeld.",
  imageUnreadable: "Die afbeelding kon niet worden gelezen.",
  photoAnalyseFailed: "Die foto kon niet worden geanalyseerd.",

  handScan: "Handscan",
  back: "Terug",
  switchCamera: "Wissel camera",
  showHand: "Toon je hand",
  showHandDetail: "Palm omlaag, vingers ontspannen en licht uit elkaar",
  moveCloser: "Kom iets dichterbij",
  moveCloserDetail: "Vul het kader met je hand",
  wholeHand: "Breng de hele hand in beeld",
  wholeHandDetail: "Alle vijf vingertoppen moeten zichtbaar zijn",
  holdStill: "Houd stil",
  holdStillDetail: "Bijna — nu even stilhouden",
  measuring: "Meten",
  measuringDetail: "Houd je hand precies waar die is",
  preparingScanner: "Scanner wordt voorbereid",
  loadingModel: "Handtrackingmodel laden",
  recommending: "Aanbevolen",
  tryAgain: "Opnieuw proberen",
  uploadPhoto: "Upload een foto",
  scannerUnavailable: "De scanner is niet beschikbaar.",
  cameraUnsupported:
    "Deze browser kan geen camera openen. Upload in plaats daarvan een foto van je hand.",
  cameraDenied:
    "Cameratoegang is geweigerd. Sta dit toe in je browserinstellingen, of upload een foto.",
  cameraNotFound: "Geen bruikbare camera gevonden op dit apparaat.",
  cameraStartFailed: "De camera kon niet worden gestart.",
  modelLoadFailed: "Het handtrackingmodel kon niet worden geladen.",

  yourResult: "Jouw resultaat",
  saveImage: "Afbeelding opslaan",
  match: "Match",
  stylistPick: "Stylistenkeuze",
  holdToCompare: "Houd om te vergelijken",
  bareHand: "Zonder overlay",
  align: "Uitlijnen",
  fineTuneAlignment: "Uitlijning verfijnen",
  recommendedShape: "Aanbevolen vorm",
  previewing: "Voorbeeld",
  shape: "Vorm",
  alsoSuitsYou: "Past ook bij jou",
  offPickNote: (shapeName) =>
    `Leuk alternatief — jouw scan past het best bij ${shapeName}.`,
  shapeSummaries: {
    round:
      "Klassiek en natuurlijk. Soft aan de tip, makkelijk te onderhouden en altijd verzorgd.",
    oval: "Laat je vingers optisch iets langer lijken, met een zachte curve die overal past.",
    squoval:
      "Strak genoeg om modern te ogen, maar met zachte hoeken. Perfect voor elke dag.",
    almond:
      "Laat je vingers optisch langer en slanker lijken. Elegant, vrouwelijk en heel flattering.",
    coffin:
      "Geeft een hele strakke, elegante look met een platte tip. Stoer én verfijnd tegelijk.",
    stiletto:
      "De meest opvallende vorm: lang, scherp en vol drama. Voor als je écht wilt shinen.",
  },
  saveThisLook: "Bewaar deze look",
  scanAgain: "Opnieuw scannen",
  nextClient: "Nieuwe Scan",

  shareTitle: "Jouw look",
  shareSubtitle: "Neem 'm mee",
  shareScanHint: "Scan om deze vorm en kleur op je eigen telefoon te openen.",
  shareShape: "Vorm",
  shareColour: "Kleur",
  shareDownload: "Afbeelding downloaden",
  shareSend: "Versturen",
  shareCopyLink: "Link kopiëren",
  shareLinkCopied: "Link gekopieerd",
  shareClose: "Sluiten",
  shareQrAlt: "QR-code met een link naar deze look",

  colourDesign: "Kleur & Design",
  shades: (count) => `${count} tinten`,
  categorySolid: "Effen kleuren",
  categoryChrome: "Chrome & Glazed",
  categoryFrench: "French & Minimal",
  categoryTrending: "Trending designs",
  skinBadge: (depth, undertone) => `${depth} huid · ${undertone} undertone`,
  undertoneWarm: "warme",
  undertoneCool: "koele",
  undertoneNeutral: "neutrale",
  depthFair: "Zeer lichte",
  depthLight: "Lichte",
  depthMedium: "Medium",
  depthTan: "Getinte",
  depthDeep: "Donkere",
  adviceWarm:
    "Gouden en karamelbasissen komen prachtig uit op jouw huid. Kies champagne chrome, café crème en terracotta vóór blauwige tinten.",
  adviceCool:
    "Jouw huid heeft een roze ondertoon, dus rose, mauve en zilverige tinten lezen het zuiverst. IJzige chromes en bordeaux ogen bewust in plaats van hard.",
  adviceNeutral:
    "Je zit tussen warm en koel — de zeldzame huid die bijna alles kan dragen. Melkachtige nudes en glazed pearls blijven je veiligste luxe.",

  alignAlong: "Positie langs de vinger",
  alignAcross: "Positie over de nagel",
  alignWidth: "Breedte",
  alignLength: "Lengte",
  resetAlignment: "Uitlijning resetten",
};

export const COPY: Record<Language, Copy> = { en: EN, nl: NL };

export function copyFor(language: Language): Copy {
  return COPY[language];
}
