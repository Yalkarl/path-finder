with open(r"c:\Users\User\OneDrive\Desktop\Path-Finder\src\app\setup\grades\page.js", "rb") as f:
    data = f.read()

# Decode ignoring invalid characters
text = data.decode("utf-8", errors="ignore")

with open(r"c:\Users\User\OneDrive\Desktop\Path-Finder\src\app\setup\grades\page.js", "w", encoding="utf-8") as f:
    f.write(text)

print("Repair completed!")
