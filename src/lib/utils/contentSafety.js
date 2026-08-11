/**
 * Utility to check if custom text input contains profanity, toxic words, off-topic chatter, or gibberish keyboard mash.
 * Smartly allows real answers that happen to end with friendly chatter words (e.g. "ค้าบเธอ").
 * 
 * @param {string} text - User input string
 * @returns {boolean} - true if profane, toxic, off-topic chatter, or gibberish
 */
export function isProfanityOrGibberish(text) {
  if (!text || typeof text !== 'string') return true;
  const cleaned = text.trim().toLowerCase();
  if (cleaned.length < 3) return true;

  // 1. Strict Explicit Profanity List (Always reject if explicit profanity exists anywhere)
  const explicitProfanityPattern = /(ควย|เหี้ย|เชี่ย|ส้นตีน|เย็ด|มึง|กู|สัส|ดกทอง|แม่ง|ชิปหาย|ฉิบหาย|ตอแหล|เสือก|สันดาน|พ่อมึง|แม่มึง|fuck|shit|bitch|asshole|cunt|dick|pussy|bastard|motherfucker|wtf)/i;
  if (explicitProfanityPattern.test(cleaned)) return true;

  // 2. Off-topic Chatter & Spam Phrases
  const chatterPattern = /(ค้าบเธอ|ครับเธอ|ค๊าบ|อิอิ|ฮ่าๆ|ฮ่าฮ่า|555|เอ๋|ไม่รู้|ไม่ทราบ|ไม่บอก|เอ่อ|อืม|อือ|เออ|จ๋า|จ้ะ|จ้า|ก้าบ|ทดสอบ|test|hello|hi|yes|no|ok|โอเค)/gi;

  // Stripping chatter words to verify if real meaningful answer content exists
  const remainingText = cleaned.replace(chatterPattern, '').replace(/[^\u0E00-\u0E7Fa-z0-9]/gi, '').trim();

  // If removing chatter words leaves less than 5 characters of actual content (e.g. just "ค้าบเธอ", "555 ค้าบ"), reject as chatter
  if (remainingText.length < 5) {
    return true;
  }

  // 3. Repeated character pattern (e.g. "aaaaa", "55555", "......")
  if (/(.)\1{4,}/.test(cleaned)) return true;

  // 4. Low character entropy (e.g. "asdasfda", "qweqwe", "123456")
  const uniqueChars = new Set(cleaned.replace(/\s+/g, '')).size;
  if (cleaned.length >= 8 && uniqueChars <= 3) return true;

  return false;
}
