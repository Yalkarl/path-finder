import os
import re

COMMENT_TRANSLATIONS = {
    # Diagnostic / scenarios API
    "Test generating a quick response using the custom gemini library (REST API)": "ทดสอบการสร้างคำตอบอย่างเร็วด้วย Gemini Library",
    "We try to generate dynamic scenarios using Gemini.": "ลองสร้างแบบทดสอบสถานการณ์แบบไดนามิกด้วย Gemini",
    "If it fails or takes too long, we can fall back to the static ones.": "หากล้มเหลวหรือรอนานเกินไป ให้ใช้ชุดคำถามสำรอง",
    "Fallback to static scenarios on error": "ใช้ชุดคำถามแบบทดสอบสำรองเมื่อเกิดข้อผิดพลาด",
    "Status 200 to keep it working seamlessly for the user": "ส่งสถานะ 200 เพื่อให้แอปทำงานได้ราบรื่นไม่สะดุด",

    # Assessment
    "Targeted role-play stage 1": "ด่านประเมินสถานการณ์เฉพาะสาย 1",
    "Randomly pick 1 theme out of 12 for the setup assessment": "สุ่มเลือก 1 ธีมจาก 12 ธีมสำหรับแบบทดสอบเริ่มต้น",
    "Save used question IDs": "บันทึกรหัสข้อคำถามที่ทำแล้ว",
    "Split option text to extract title and description": "แยกข้อความตัวเลือกเป็นหัวข้อและคำอธิบาย",

    # Achievements & Dashboard
    "Update profile if new achievements unlocked": "อัปเดตโปรไฟล์เมื่อปลดล็อกความสำเร็จใหม่",
    "Dynamic themes and question bank based on analysisMode": "คลังคำถามและธีมไดนามิกตามโหมดการวิเคราะห์",
    "In target-lock mode, the custom stages are already 100% specific, so no recommendation badges needed.": "ในโหมด Target Lock ด่านทดสอบจะตรงสาย 100% อยู่แล้ว",
    "Run migration on responses format": "ย้ายรูปแบบข้อมูลคำตอบเดิมเข้าสู่รูปแบบใหม่",
    "Compute completed using user profile mode state": "คำนวณสถานะความเสร็จสมบูรณ์จากโปรไฟล์ผู้ใช้",
    "Filter out old responses belonging to this stage": "กรองข้อมูลคำตอบเดิมของด่านนี้ออกก่อนบันทึกใหม่",
    "Update local state": "อัปเดตสถานะในตัวแปรท้องถิ่น",
    "Redirect directly to the dashboard main page to view updated results": "เปลี่ยนหน้าไปยังแดชบอร์ดหลักเพื่อดูผลลัพธ์ใหม่",
    "Stages View": "ส่วนแสดงผลด่านแบบทดสอบ",
    "Target Lock imports": "นำเข้าข้อมูลสำหรับโหมด Target Lock",
    "Self-healing: if results is an array (due to the old edit-save bug)": "ระบบซ่อมแซมข้อมูลอัตโนมัติหากรูปแบบผลลัพธ์ไม่ถูกต้อง",

    # Chat Page
    "Inner component that uses useSearchParams (must be wrapped in Suspense)": "คอมโพเนนต์ภายในที่ใช้ useSearchParams",
    "Conversation management state": "สถานะจัดการรายการบทสนทนา",
    "Track if consultPath has been handled to avoid re-triggering": "ตรวจสอบการแนะนำเส้นทางเรียนเพื่อไม่ให้ยิงซ้ำ",
    "Refresh the conversations list": "โหลดรายการบทสนทนาใหม่",
    "Load a specific conversation": "โหลดบทสนทนาที่เลือก",
    "Create a new conversation and set it as active": "สร้างบทสนทนาใหม่และตั้งเป็นบทสนทนาปัจจุบัน",
    "Close conversation panel by default on mobile screens": "ซ่อนแผงบทสนทนาบนหน้าจอมือถือเป็นค่าเริ่มต้น",
    "Always fetch latest profile from Firestore for name sync": "ดึงข้อมูลโปรไฟล์ล่าสุดจาก Firestore เพื่ออัปเดตชื่อผู้ใช้",
    "Load conversations": "โหลดรายการบทสนทนา",
    "Migration: if old chatHistory exists but no conversations yet": "ย้ายข้อมูลแชตเดิมหากยังไม่มีบทสนทนาใน Firestore",
    "Remove old chatHistory from profile": "ลบประวัติแชตเดิมออกจากโปรไฟล์",
    "Load most recent conversation and update greeting name": "โหลดบทสนทนาล่าสุดพร้อมอัปเดตชื่อทักทาย",
    "No conversations at all — create a greeting one": "หากยังไม่มีบทสนทนา ให้สร้างบทสนทนาเริ่มต้นทักทาย",
    "Auto-send a consult message": "ส่งข้อความปรึกษาแผนการเรียนให้อัตโนมัติ",
    "Use a timeout so the state is settled before calling handleSubmit": "ใช้การหน่วงเวลาเพื่อให้สถานะพร้อมก่อนส่งข้อความ",
    "Core submit handler — can accept explicit convId + msgs for consultPath flow": "ระบบจัดการส่งข้อความหลักของแชต",
    "Daily token limit check": "ตรวจสอบขีดจำกัดจำนวนคำถามรายวัน",
    "Always use latest profile name": "ใช้ชื่อโปรไฟล์ล่าสุดเสมอ",
    "Increment daily token usage after successful API call": "เพิ่มจำนวนคำถามที่ใช้วันนี้หลังส่งสำเร็จ",
    "Save conversation to Firestore": "บันทึกบทสนทนาลง Firestore",
    "Auto-title if still default": "ตั้งชื่อบทสนทนาให้อัตโนมัติหากยังใช้ชื่อเริ่มต้น",
    "Track achievements": "ตรวจสอบและอัปเดตความสำเร็จ",
    "Conversation panel actions": "ฟังก์ชันการทำงานของแผงบทสนทนา",
    "Create a fresh conversation": "สร้างห้องสนทนาใหม่",
    "Wrap in Suspense for useSearchParams": "ครอบ Suspense รองรับ useSearchParams",
    "Managed in globals.css": "ควบคุมสไตล์ผ่าน globals.css",
    "Managed responsively by globals.css": "ควบคุมสไตล์ตอบสนองหน้าจอผ่าน globals.css"
}

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False

    # Replace exact known comments
    for eng, thai in COMMENT_TRANSLATIONS.items():
        if eng in content:
            content = content.replace(eng, thai)
            modified = True

    # Pattern for single line comments starting with letter
    def replacer(match):
        nonlocal modified
        full_line = match.group(0)
        indent = match.group(1)
        comment_text = match.group(2).strip()

        # Skip ignore comments
        if 'eslint' in comment_text or 'ts-ignore' in comment_text or 'jsx' in comment_text:
            return full_line

        # Check if already Thai
        if re.search(r'[\u0e00-\u0e7f]', comment_text):
            return full_line

        # Check in translations map
        if comment_text in COMMENT_TRANSLATIONS:
            modified = True
            return f"{indent}// {COMMENT_TRANSLATIONS[comment_text]}"

        # If it's pure English comment, translate or replace with clean section header
        modified = True
        return f"{indent}// {comment_text}"

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

src_dir = r"c:\Users\User\OneDrive\Desktop\Path-Finder\src"
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.js', '.jsx')):
            filepath = os.path.join(root, file)
            clean_file(filepath)

print("Translation pass completed.")
