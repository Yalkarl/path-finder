async function testPost() {
  const url = 'https://path-finder-smart.pages.dev/api/chat';
  console.log("Sending POST request to", url);

  const payload = {
    messages: [
      { role: 'user', content: 'สวัสดีครับ Mr. Path' }
    ],
    userContext: {
      name: 'Test Student',
      educationLevel: 'junior',
      topSkills: ['logic', 'science'],
      topMatch: { name: 'วิทยาศาสตร์-คณิตศาสตร์', matchPercentage: 95 },
      analysisMode: 'discovery',
      portfolio: [],
      customActivities: []
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log("Response status:", res.status);
    const text = await res.text();
    console.log("Response text body:", text);
  } catch (error) {
    console.error("Fetch failed with error:", error);
  }
}

testPost();
