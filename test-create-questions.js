const axios = require('axios');

const BASE_URL = 'http://localhost:3100';

const questionsPayload = [
  {
    "questionText": "What is the perimeter of a rectangle with length 8 cm and breadth 5 cm?",
    "questionType": "MCQ",
    "difficulty": "EASY",
    "options": [
      { 
        "text": "26 cm", 
        "isCorrect": true, 
        "explanation": "Perimeter = 2 × (8 + 5) = 26 cm." 
      },
      { 
        "text": "30 cm", 
        "isCorrect": false, 
        "explanation": "30 cm would be if the sides were 10 cm and 5 cm." 
      }
    ],
    "explanation": "Perimeter of a rectangle is twice the sum of its length and breadth.",
    "marks": 1,
    "subjectId": "f9215d29-cbd9-48a0-9691-4d7a50b226ac",
    "chapterId": "2680ef06-eafb-43b8-91f1-16020a20e217",
    "isActive": true,
    "grade": 10,
    "board": "CBSE"
  },
  {
    "questionText": "The perimeter of a square is 20 cm. What is the length of one side?",
    "questionType": "MCQ",
    "difficulty": "EASY",
    "options": [
      { 
        "text": "5 cm", 
        "isCorrect": true, 
        "explanation": "Side = Perimeter ÷ 4 = 20 ÷ 4 = 5 cm." 
      },
      { 
        "text": "4 cm", 
        "isCorrect": false, 
        "explanation": "4 cm × 4 = 16 cm, not 20 cm." 
      }
    ],
    "explanation": "In a square, perimeter = 4 × side length.",
    "marks": 1,
    "subjectId": "f9215d29-cbd9-48a0-9691-4d7a50b226ac",
    "chapterId": "2680ef06-eafb-43b8-91f1-16020a20e217",
    "isActive": true,
    "grade": 10,
    "board": "CBSE"
  }
];

async function testCreateQuestions() {
  console.log('🧪 Testing Question Creation...\n');
  
  try {
    console.log('📤 Sending request to create questions...');
    console.log('Endpoint:', `${BASE_URL}/question`);
    console.log('Payload:', JSON.stringify(questionsPayload, null, 2));
    
    const response = await axios.post(`${BASE_URL}/question`, questionsPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('\n✅ Success! Questions created successfully');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('\n❌ Error creating questions:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    
    if (error.response?.data) {
      console.log('Error Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error Message:', error.message);
    }
    
    // Additional debugging info
    if (error.response?.status === 400) {
      console.log('\n🔍 This is a validation error. Check:');
      console.log('1. All required fields are present');
      console.log('2. UUIDs are in correct format');
      console.log('3. Enum values are valid (CBSE, MCQ, EASY)');
      console.log('4. Options array has at least one correct answer');
    }
  }
}

// Run the test
testCreateQuestions();