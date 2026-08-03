// ==========================================
// ฟังก์ชันจัดการการดึงข้อมูลพร้อมระบบ Retry และ Fallback อัตโนมัติ
// ==========================================
async function fetchWithRetry(url, options, maxRetries = 3, initialDelay = 1000) {
  let delay = initialDelay;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url, options);
      // ลองใหม่อัตโนมัติหากเจอสถานะ 503 หรือ 429
      if (res.status === 503 || res.status === 429) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      return res;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  return fetch(url, options);
}

// ==========================================
// การเรียกใช้งาน Google Gemini API พร้อมระบบสลับโมเดลอัตโนมัติ
// ==========================================
export const getGeminiModel = (modelName = 'gemini-3.1-flash-lite', systemInstruction = null) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in environment variables');
  }

  const primaryModel = modelName;
  const fallbackModel = 'gemini-1.5-flash';

  return {
    async generateContent(options) {
      const contents = options.contents;
      const responseMimeType = options.generationConfig?.responseMimeType;

      const makePayload = (sysInstruction) => {
        const payload = {
          contents,
          generationConfig: responseMimeType ? { responseMimeType } : undefined
        };
        if (sysInstruction) {
          payload.systemInstruction = { parts: [{ text: sysInstruction }] };
        }
        return payload;
      };

      const callApi = async (targetModel) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
        return fetchWithRetry(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(makePayload(systemInstruction))
        });
      };

      let res = await callApi(primaryModel);

      // หากโมเดลหลักขัดข้องหรือติด Rate Limit ให้สลับไปใช้โมเดลสำรองอัตโนมัติ
      if (!res.ok && primaryModel !== fallbackModel) {
        console.warn(`Primary Gemini model (${primaryModel}) failed with status ${res.status}. Falling back to ${fallbackModel}...`);
        res = await callApi(fallbackModel);
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      
      return {
        response: {
          text() {
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          }
        }
      };
    },

    startChat(chatConfig) {
      const history = chatConfig.history || [];
      
      return {
        async sendMessageStream(messageText) {
          const contents = [
            ...history.map(h => ({
              role: h.role,
              parts: h.parts.map(p => ({ text: p.text }))
            })),
            { role: 'user', parts: [{ text: messageText }] }
          ];

          const makePayload = () => {
            const payload = { contents };
            if (systemInstruction) {
              payload.systemInstruction = { parts: [{ text: systemInstruction }] };
            }
            return payload;
          };

          const callStream = async (targetModel) => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:streamGenerateContent?key=${apiKey}`;
            return fetchWithRetry(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(makePayload())
            });
          };

          let res = await callStream(primaryModel);

          if (!res.ok && primaryModel !== fallbackModel) {
            console.warn(`Primary Gemini stream model (${primaryModel}) failed with status ${res.status}. Falling back to ${fallbackModel}...`);
            res = await callStream(fallbackModel);
          }

          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Gemini stream error (${res.status}): ${errText}`);
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();

          const streamIterator = {
            async *[Symbol.asyncIterator]() {
              let buffer = '';
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                const regex = /"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
                let match;
                let lastIndex = 0;
                let yieldedText = '';

                while ((match = regex.exec(buffer)) !== null) {
                  try {
                    yieldedText += JSON.parse(`"${match[1]}"`);
                  } catch (e) {
                    yieldedText += match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
                  }
                  lastIndex = regex.lastIndex;
                }

                if (lastIndex > 0) {
                  buffer = buffer.substring(lastIndex);
                }

                if (yieldedText) {
                  yield {
                    text() {
                      return yieldedText;
                    }
                  };
                }
              }
            }
          };

          return {
            stream: streamIterator
          };
        }
      };
    }
  };
};

