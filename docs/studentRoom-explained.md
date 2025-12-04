# 📚 Understanding `studentRoom.tsx` - A Complete Walkthrough

Welcome! This guide will walk you through the `studentRoom.tsx` file step-by-step, explaining what each part does and why we made specific changes.

---

## 🎯 What Does This File Do?

This component displays all assignments available in a student's room. When a student joins a room, they land on this page and can see all assignments the teacher has created.

---

## 📂 The Complete Code

```tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardBody } from "@heroui/card";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Assignment {
    id: string;
    title: string;
    pdfUrl: string;
}

export default function StudentRoom() {
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(true)

    const router = useRouter();
    const params = useParams()
    const roomId = params.roomId as string;
    
    useEffect(() => {
        fetchAssignments();
    }, [roomId])

    const fetchAssignments = async () => {
        try {
            setLoading(true)
            const response = await fetch(`http://localhost:1000/api/assignment/${roomId}`, {
                method: "GET",
                credentials: "include"
            })
            const data = await response.json();
            console.log("API Response:", data)
            
            if (data.assignments) {
                setAssignments(data.assignments)
                console.log("Assignments:", data.assignments)
            }
        } catch(e) {
            console.log("Error fetching assignments:", e)
        } finally {
            setLoading(false)
        }
    }

    const handleAssignmentClick = (assignmentId: string) => {
        console.log("Assignment ID clicked:", assignmentId)
        router.push(`/room/${roomId}/assignment/${assignmentId}`)
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Assignments</h1>
            
            {loading ? (
                <p>Loading assignments...</p>
            ) : assignments.length === 0 ? (
                <p>No assignments found for this room.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assignments.map((assignment) => (
                        <Card 
                            key={assignment.id}
                            isPressable 
                            onPress={() => handleAssignmentClick(assignment.id)}
                            className="border-2 border-gray-200 hover:border-gray-300 transition-colors"
                        >
                            <CardBody>
                                <h3 className="font-semibold">{assignment.title}</h3>
                                <p className="text-sm text-gray-500 mt-2">Click to view details</p>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
```

---

## 🔍 Line-by-Line Breakdown

### 1️⃣ The "use client" Directive

```tsx
"use client"
```

**What it does:** Tells Next.js this is a Client Component.

**Why we need it:** 
- We use `useState` and `useEffect` (React hooks)
- Hooks only work in Client Components
- Without this, Next.js treats it as a Server Component and you'll get errors

---

### 2️⃣ Imports

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardBody } from "@heroui/card";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
```

| Import | What It Does |
|--------|--------------|
| `Button`, `Input` | UI components (not currently used, kept for future) |
| `Card`, `CardBody` | Card components from HeroUI to display assignments |
| `useState` | React hook to store and update data |
| `useEffect` | React hook to run code when component loads |
| `useParams` | Next.js hook to get URL parameters (like `roomId`) |
| `useRouter` | Next.js hook to navigate to different pages |

---

### 3️⃣ TypeScript Interface

```tsx
interface Assignment {
    id: string;
    title: string;
    pdfUrl: string;
}
```

**What it does:** Defines the "shape" of an assignment object.

**Why we need it:**
- TypeScript needs to know what properties each assignment has
- Gives us autocomplete when typing `assignment.`
- Catches errors if we try to access wrong properties

**Example:** If you try `assignment.xyz`, TypeScript will show an error because `xyz` isn't in our interface.

---

### 4️⃣ State Variables

```tsx
const [assignments, setAssignments] = useState<Assignment[]>([])
const [loading, setLoading] = useState(true)
```

#### Understanding `useState` Syntax:

```tsx
const [value, setValue] = useState<Type>(initialValue)
//     ↑         ↑                  ↑         ↑
//   current   function         TypeScript   starting
//   value     to update it     type hint    value
```

| State Variable | Type | Initial Value | Purpose |
|----------------|------|---------------|---------|
| `assignments` | `Assignment[]` (array) | `[]` (empty array) | Stores all assignments from API |
| `loading` | `boolean` | `true` | Shows loading state while fetching |

---

### 5️⃣ Router and Params

```tsx
const router = useRouter();
const params = useParams()
const roomId = params.roomId as string;
```

**`useRouter()`** - Gives us a router object to navigate programmatically:
```tsx
router.push('/some-page')  // Navigate to a page
router.back()              // Go back
```

**`useParams()`** - Gets URL parameters. If URL is `/room/abc123`, then:
```tsx
params.roomId  // Returns "abc123"
```

**`as string`** - TypeScript casting. `params.roomId` could be `string | string[] | undefined`, so we tell TypeScript "trust me, it's a string."

---

### 6️⃣ useEffect Hook

```tsx
useEffect(() => {
    fetchAssignments();
}, [roomId])
```

#### Understanding useEffect Syntax:

```tsx
useEffect(() => {
    // Code to run
}, [dependencies])
```

**The dependency array `[roomId]` means:**
- Run this code when:
  1. Component first loads (mounts)
  2. `roomId` value changes

| Dependency Array | Behavior |
|------------------|----------|
| `[]` (empty) | Run once on mount only |
| `[roomId]` | Run on mount + when roomId changes |
| No array | Run on every render (usually bad!) |

---

### 7️⃣ The Fetch Function

```tsx
const fetchAssignments = async () => {
    try {
        setLoading(true)
        const response = await fetch(`http://localhost:1000/api/assignment/${roomId}`, {
            method: "GET",
            credentials: "include"
        })
        const data = await response.json();
        console.log("API Response:", data)
        
        if (data.assignments) {
            setAssignments(data.assignments)
            console.log("Assignments:", data.assignments)
        }
    } catch(e) {
        console.log("Error fetching assignments:", e)
    } finally {
        setLoading(false)
    }
}
```

#### Breaking it down:

| Line | Explanation |
|------|-------------|
| `async () =>` | Makes this function asynchronous (can use `await`) |
| `setLoading(true)` | Show "Loading..." to user |
| `await fetch(...)` | Make HTTP request and wait for response |
| `credentials: "include"` | Send cookies (for authentication) |
| `await response.json()` | Parse response body as JSON |
| `data.assignments` | Access the array inside `{assignments: [...]}` |
| `setAssignments(...)` | Store assignments in state |
| `finally` | Runs whether success or error - stops loading |

#### What the API returns:
```json
{
    "assignments": [
        { "id": "abc123", "title": "Math Homework", "pdfUrl": "..." },
        { "id": "def456", "title": "Science Quiz", "pdfUrl": "..." }
    ]
}
```

---

### 8️⃣ Click Handler

```tsx
const handleAssignmentClick = (assignmentId: string) => {
    console.log("Assignment ID clicked:", assignmentId)
    router.push(`/room/${roomId}/assignment/${assignmentId}`)
}
```

**What it does:**
1. Logs the clicked assignment ID (for debugging)
2. Navigates to the assignment detail page

**Example:** If `roomId = "room1"` and clicked `assignmentId = "assign1"`:
```
Navigates to: /room/room1/assignment/assign1
```

---

### 9️⃣ The JSX Return

```tsx
return (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Assignments</h1>
        
        {loading ? (
            <p>Loading assignments...</p>
        ) : assignments.length === 0 ? (
            <p>No assignments found for this room.</p>
        ) : (
            // Assignment grid here
        )}
    </div>
)
```

#### Ternary Operator Chain:

```tsx
{condition1 ? (
    // If condition1 is true
) : condition2 ? (
    // If condition1 is false BUT condition2 is true  
) : (
    // If both conditions are false
)}
```

**Our logic:**
1. If `loading` is true → Show "Loading..."
2. Else if `assignments.length === 0` → Show "No assignments"
3. Else → Show the assignment cards

---

### 🔟 Mapping Over Assignments

```tsx
{assignments.map((assignment) => (
    <Card 
        key={assignment.id}
        isPressable 
        onPress={() => handleAssignmentClick(assignment.id)}
        className="border-2 border-gray-200 hover:border-gray-300 transition-colors"
    >
        <CardBody>
            <h3 className="font-semibold">{assignment.title}</h3>
            <p className="text-sm text-gray-500 mt-2">Click to view details</p>
        </CardBody>
    </Card>
))}
```

#### Understanding `.map()`:

```tsx
array.map((item) => <Component />)
```

For each item in the array, return a component. If we have 3 assignments, we get 3 Cards.

#### Important Props:

| Prop | Purpose |
|------|---------|
| `key={assignment.id}` | Unique identifier for React to track each card |
| `isPressable` | Makes the card clickable |
| `onPress={() => ...}` | What happens when clicked |

---

## 🐛 What Was Wrong Before (The Bug)

### Original Problematic Code:

```tsx
const assignmentsInRoom = async () => {
    const response = await fetch(`http://localhost:1000/api/assignment/${roomId}`, {...})
    const data = await response.json();
    setPdfUrl(data.pdfUrl)        // ❌ Wrong! API returns {assignments: [...]}
    setAssignmentId(data.id)      // ❌ Wrong! data.id is undefined
    console.log(assignmentId)     // ❌ Always undefined!
}
```

### Why `assignmentId` Was Undefined:

**Problem:** `useState` updates are asynchronous!

```tsx
setAssignmentId(data.id)
console.log(assignmentId)  // Still shows OLD value!
```

**How React State Works:**

```
setAssignmentId("abc123")  ← Schedules update (doesn't happen immediately)
console.log(assignmentId)  ← Runs BEFORE update is applied
        ↓
    Still shows "" (the initial value)
```

**Solution:** Log the data directly, not the state:
```tsx
console.log(data.id)  // ✅ Shows the actual value
```

---

## ✅ Summary of Changes

| Before | After | Why |
|--------|-------|-----|
| Single assignment state | Array of assignments | API returns array |
| Manual button click to fetch | Automatic fetch with useEffect | Better UX |
| `data.id` | `data.assignments[i].id` | Correct API response structure |
| Logging state after setting | Logging data directly | State updates async |
| Static card | Dynamic cards with map | Display all assignments |

---

## 🎓 Key Takeaways

1. **Always check your API response structure** - Use console.log or Network tab
2. **State updates are asynchronous** - Don't expect new values immediately
3. **Use useEffect for data fetching** - Runs automatically when component loads
4. **TypeScript interfaces = safety** - Define your data shapes
5. **Always provide `key` when mapping** - React needs it to track list items

---

Happy coding! 🚀
