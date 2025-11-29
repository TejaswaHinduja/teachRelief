# API Route Testing Guide

## Prerequisites
1. Backend server running on `http://localhost:1000`
2. User logged in (to get JWT cookie)
3. Room created (to get roomId)

## Test 1: Create Assignment (Teacher)

**Endpoint:** `POST http://localhost:1000/api/createAssignment`

**Headers:**
- `Content-Type: application/json`
- `Cookie: jwt=<your-jwt-token>`

**Body:**
```json
{
  "title": "Math Assignment - Chapter 1",
  "roomId": "replace-with-actual-room-id",
  "pdfUrl": "https://ik.imagekit.io/your-pdf-url",
  "solutionText": "This is the extracted text from teacher's solution PDF"
}
```

**Expected Response (201):**
```json
{
  "message": "Assignment created successfully",
  "assignmentId": "generated-assignment-id"
}
```

---

## Test 2: Submit Assignment (Student)

**Endpoint:** `POST http://localhost:1000/api/submission`

**Headers:**
- `Content-Type: application/json`
- `Cookie: jwt=<your-jwt-token>`

**Body:**
```json
{
  "assignmentId": "assignment-id-from-test-1",
  "pdfUrl": "https://ik.imagekit.io/student-solution-pdf-url",
  "extractedText": "This is the extracted text from student's solution PDF"
}
```

**Expected Response (201):**
```json
{
  "message": "Submission created successfully",
  "submissionId": "generated-submission-id"
}
```

---

## Testing Steps

### Step 1: Get Authentication Token
1. Login as teacher: `POST /api/login`
2. Copy the JWT from the cookie in browser DevTools or response headers

### Step 2: Get Room ID
1. Create a room: `POST /api/createroom`
2. Copy the `roomId` from the response

### Step 3: Test Assignment Creation
1. Use the test data above
2. Replace `roomId` with actual room ID
3. Send request with Postman/Thunder Client/curl
4. Note the returned `assignmentId`

### Step 4: Test Submission
1. Login as a different user (student)
2. Get their JWT token
3. Use the `assignmentId` from Step 3
4. Send submission request

### Step 5: Verify Database
Check your database to ensure:
- Assignment table has the new record
- Submission table has the new record
- All fields are properly saved

---

## Testing with Frontend

Your current room page already has:
- ✅ PDF upload to ImageKit
- ✅ OCR extraction

**Next step:** Call the backend routes after OCR extraction:

```typescript
// After handleOCR completes successfully:
const response = await fetch("http://localhost:1000/api/submission", {
  method: "POST",
  credentials: "include", // Important: sends JWT cookie
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    assignmentId: "get-from-props-or-state",
    pdfUrl: pdfUrl,
    extractedText: ocrText
  })
});
```
